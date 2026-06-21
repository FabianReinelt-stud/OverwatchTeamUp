import {describe, expect, it} from "vitest";
import {readdirSync, statSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import * as ts from "typescript";

const sourceRoot = path.dirname(fileURLToPath(import.meta.url));

const collectProductionFiles = (directory: string): string[] =>
    readdirSync(directory).flatMap((entry) => {
        const absolutePath = path.join(directory, entry);
        if (statSync(absolutePath).isDirectory()) {
            return collectProductionFiles(absolutePath);
        }
        return /\.(ts|tsx)$/.test(entry) && !entry.includes(".test.") && !entry.endsWith(".d.ts")
            ? [path.resolve(absolutePath)]
            : [];
    });

const productionFiles = collectProductionFiles(sourceRoot);
const productionFileSet = new Set(productionFiles);
const relativePath = (file: string) => path.relative(sourceRoot, file).replaceAll("\\", "/");

const parseSource = (file: string) => ts.createSourceFile(
    file,
    ts.sys.readFile(file) ?? "",
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
);

const resolveLocalImport = (sourceFile: string, specifier: string): string | null => {
    if (!specifier.startsWith(".")) {
        return null;
    }

    const basePath = path.resolve(path.dirname(sourceFile), specifier);
    const candidates = [basePath, `${basePath}.ts`, `${basePath}.tsx`, path.join(basePath, "index.ts"), path.join(basePath, "index.tsx")];
    return candidates.find((candidate) => productionFileSet.has(path.resolve(candidate))) ?? null;
}

const localImports = (file: string): string[] => {
    const imports: string[] = [];
    parseSource(file).forEachChild((node) => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
            && node.moduleSpecifier
            && ts.isStringLiteral(node.moduleSpecifier)) {
            const resolvedImport = resolveLocalImport(file, node.moduleSpecifier.text);
            if (resolvedImport) {
                imports.push(resolvedImport);
            }
        }
    });
    return imports;
}

const importGraph = new Map(productionFiles.map((file) => [file, localImports(file)]));

const findImportCycles = (): string[][] => {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const active = new Set<string>();
    const stack: string[] = [];

    const visit = (file: string) => {
        if (active.has(file)) {
            const cycleStart = stack.indexOf(file);
            cycles.push([...stack.slice(cycleStart), file].map(relativePath));
            return;
        }
        if (visited.has(file)) {
            return;
        }

        visited.add(file);
        active.add(file);
        stack.push(file);
        importGraph.get(file)?.forEach(visit);
        stack.pop();
        active.delete(file);
    };

    productionFiles.forEach(visit);
    return cycles;
}

const staticFetchPath = (node: ts.CallExpression): string | null => {
    if (!ts.isIdentifier(node.expression) || node.expression.text !== "fetch" || node.arguments.length === 0) {
        return null;
    }
    const argument = node.arguments[0];
    if (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) {
        return argument.text;
    }
    if (ts.isTemplateExpression(argument)) {
        return argument.head.text;
    }
    return null;
}

describe("frontend architecture", () => {
    it("has no circular dependencies between production modules", () => {
        expect(findImportCycles()).toEqual([]);
    });

    it("keeps data and authentication infrastructure independent from UI modules", () => {
        const infrastructureFiles = productionFiles.filter((file) => {
            const relativeFile = relativePath(file);
            return relativeFile === "auth.ts" || relativeFile.startsWith("data/");
        });
        const violations = infrastructureFiles.flatMap((file) =>
            (importGraph.get(file) ?? [])
                .filter((dependency) => !relativePath(dependency).startsWith("data/") && relativePath(dependency) !== "auth.ts")
                .map((dependency) => `${relativePath(file)} -> ${relativePath(dependency)}`),
        );

        expect(violations).toEqual([]);
    });

    it("routes protected API calls through the authentication module", () => {
        const protectedPrefixes = ["/api/team-compositions", "/api/auth/logout", "/api/auth/token/refresh"];
        const violations: string[] = [];

        productionFiles.forEach((file) => {
            if (relativePath(file) === "auth.ts") {
                return;
            }
            const inspect = (node: ts.Node) => {
                if (ts.isCallExpression(node)) {
                    const requestPath = staticFetchPath(node);
                    if (requestPath && protectedPrefixes.some((prefix) => requestPath.startsWith(prefix))) {
                        violations.push(`${relativePath(file)} -> ${requestPath}`);
                    }
                }
                ts.forEachChild(node, inspect);
            };
            inspect(parseSource(file));
        });

        expect(violations).toEqual([]);
    });
});
