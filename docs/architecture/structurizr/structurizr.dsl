workspace "OverwatchTeamUp" "C4 model of the OverwatchTeamUp application." {

    !identifiers hierarchical

    model {
        user = person "Overwatch Player" "Browses hero statistics and manages personal team compositions."

        owtu = softwareSystem "OverwatchTeamUp" "Provides cached Overwatch hero data and lets authenticated players manage team compositions." {
            frontend = container "Web Application" "Browser-based user interface for browsing heroes and managing team compositions. Currently developed on the frontend branch." "TypeScript 6, React 19, Vite 8" {
                appShell = component "Application Shell" "Owns top-level login and team composition view state and arranges the main page." "React App component"
                heroBrowser = component "Hero Browser" "Loads and filters hero summaries. The detailed hero panel currently displays static prototype data." "React components: SideBar, SearchBar, List, HeroView"
                teamCompositionUi = component "Team Composition UI" "Displays role slots and existing team compositions. Selection and save behavior are still under development." "React components: TeamComposition, TeamList"
                authenticationUi = component "Authentication UI" "Provides login and registration forms and currently calls authentication endpoints directly." "React component: UserContractView"
                prototypeData = component "Prototype Data" "Supplies local hero and team composition data while API integration is incomplete." "JSON fixtures, generated TypeScript DTOs" {
                    tags "Data"
                }
            }

            backend = container "Backend API" "Provides the REST API, authentication, persistence, and hero synchronization." "Python 3.12, Django 6, Django REST Framework" {
                authenticationApi = component "Authentication API" "Registers users, issues JWT access and refresh tokens, and authenticates protected requests." "Django REST Framework, Simple JWT"
                heroApi = component "Hero API Views" "Provides public endpoints for listing heroes and retrieving hero details." "Django REST Framework function-based views"
                teamCompositionApi = component "Team Composition API Views" "Provides authenticated CRUD endpoints scoped to the current user's team compositions." "Django REST Framework function-based views"

                serializers = component "API Serializers" "Validates request payloads and maps domain entities to API DTOs." "Django REST Framework serializers"
                heroDatabaseAdapter = component "Hero Database Adapter" "Implements the hero persistence port using Django models and maps between database records and domain entities." "Python, Django ORM"
                teamCompositionDatabaseAdapter = component "Team Composition Database Adapter" "Implements user-scoped team composition persistence and maps records to domain entities." "Python, Django ORM"

                heroSyncCommand = component "Hero Sync Command" "Runs the hero synchronization during backend startup or via manage.py sync_heroes." "Django management command"
                heroSyncService = component "Hero Sync Service" "Coordinates fetching all heroes and upserting them through application ports." "Python application service"
                overfastApiAdapter = component "OverFast API Adapter" "Implements the external hero source port and maps OverFast responses to domain entities." "Python, Requests"
            }

            database = container "Database" "Stores users, heroes, abilities, and user-owned team compositions." "PostgreSQL 16" {
                tags "Database"
            }
        }

        externalHeroApi = softwareSystem "OverFast API" "Third-party API providing Overwatch hero details and competitive statistics."

        user -> owtu.frontend "Uses"
        owtu.frontend -> owtu.backend "Calls the REST API and sends JWT bearer tokens" "JSON/HTTPS"
        owtu.backend -> owtu.database "Reads and writes application data" "Django ORM/SQL"
        owtu.backend -> externalHeroApi "Synchronizes hero details and statistics" "JSON/HTTPS"

        owtu.frontend -> owtu.backend.authenticationApi "Registers, signs in, and refreshes tokens via" "JSON/HTTPS"
        owtu.frontend -> owtu.backend.heroApi "Browses heroes via" "JSON/HTTPS"
        owtu.frontend -> owtu.backend.teamCompositionApi "Manages team compositions via" "JSON/HTTPS"

        owtu.frontend.appShell -> owtu.frontend.heroBrowser "Displays"
        owtu.frontend.appShell -> owtu.frontend.teamCompositionUi "Displays and controls"
        owtu.frontend.appShell -> owtu.frontend.authenticationUi "Tracks login state from"
        owtu.frontend.heroBrowser -> owtu.frontend.prototypeData "Uses fallback hero data from"
        owtu.frontend.teamCompositionUi -> owtu.frontend.prototypeData "Uses fallback team composition data from"
        owtu.frontend.heroBrowser -> owtu.backend.heroApi "Loads hero summaries directly with fetch" "JSON/HTTPS"
        owtu.frontend.teamCompositionUi -> owtu.backend.teamCompositionApi "Loads team compositions directly with fetch" "JSON/HTTPS"
        owtu.frontend.authenticationUi -> owtu.backend.authenticationApi "Registers and signs in directly with fetch" "JSON/HTTPS"

        owtu.backend.authenticationApi -> owtu.backend.serializers "Validates registration data with"
        owtu.backend.authenticationApi -> owtu.database "Stores users and verifies credentials using" "Django ORM/SQL"

        owtu.backend.heroApi -> owtu.backend.serializers "Serializes responses with"
        owtu.backend.heroApi -> owtu.backend.heroDatabaseAdapter "Reads heroes through"

        owtu.backend.teamCompositionApi -> owtu.backend.serializers "Validates requests and serializes responses with"
        owtu.backend.teamCompositionApi -> owtu.backend.teamCompositionDatabaseAdapter "Reads and writes team compositions through"
        owtu.backend.teamCompositionApi -> owtu.backend.heroDatabaseAdapter "Resolves selected heroes through"

        owtu.backend.teamCompositionDatabaseAdapter -> owtu.backend.heroDatabaseAdapter "Loads referenced heroes through"
        owtu.backend.heroDatabaseAdapter -> owtu.database "Reads and writes heroes and abilities" "Django ORM/SQL"
        owtu.backend.teamCompositionDatabaseAdapter -> owtu.database "Reads and writes user-owned team compositions" "Django ORM/SQL"

        owtu.backend.heroSyncCommand -> owtu.backend.heroSyncService "Starts"
        owtu.backend.heroSyncService -> owtu.backend.overfastApiAdapter "Fetches heroes through"
        owtu.backend.heroSyncService -> owtu.backend.heroDatabaseAdapter "Upserts heroes through"
        owtu.backend.overfastApiAdapter -> externalHeroApi "Fetches hero lists, details, and competitive statistics from" "JSON/HTTPS"
    }

    views {
        systemContext owtu "Context_Diagram" {
            include *
            autoLayout lr
            description "System context for OverwatchTeamUp."
        }

        container owtu "Container_Diagram" {
            include *
            autoLayout lr
            description "Runtime containers and external dependencies of OverwatchTeamUp."
        }

        component owtu.backend "Component_Diagram_Backend" {
            include *
            autoLayout lr
            description "Implemented components of the Django backend."
        }

        component owtu.frontend "Component_Diagram_Frontend" {
            include *
            autoLayout lr
            description "Current frontend prototype components on the frontend branch."
        }

        styles {
            element "Element" {
                color #55aa55
                stroke #55aa55
                strokeWidth 7
                shape roundedbox
            }
            element "Person" {
                shape person
            }
            element "Database" {
                shape cylinder
            }
            element "Data" {
                shape folder
            }
            element "Boundary" {
                strokeWidth 5
            }
            relationship "Relationship" {
                thickness 4
            }
        }
    }

    configuration {
        scope softwaresystem
    }
}
