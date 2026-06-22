workspace "OverwatchTeamUp" "C4 model of the OverwatchTeamUp application." {

    !identifiers hierarchical

    model {
        user = person "Overwatch Player" "Browses hero statistics and manages personal team compositions."

        owtu = softwareSystem "OverwatchTeamUp" "Provides cached Overwatch hero data and lets authenticated players manage team compositions." {
            frontend = container "Web Application" "Browser UI for heroes and team compositions." "TypeScript, React, Vite" {
                appShell = component "Application Shell" "Owns top-level login and team composition view state and arranges the main page." "React App component"
                heroBrowser = component "Hero Browser" "Loads and filters hero summaries. The detailed hero panel currently displays static prototype data." "React components: SideBar, SearchBar, List, HeroView"
                teamCompositionUi = component "Team Composition UI" "Creates and manages personal team compositions." "React"
                authenticationUi = component "Authentication UI" "Provides login and registration forms and currently calls authentication endpoints directly." "React component: UserContractView"
                prototypeData = component "Prototype Data" "Supplies local hero and team composition data while API integration is incomplete." "JSON fixtures, generated TypeScript DTOs" {
                    tags "Data"
                }
            }

            backend = container "Backend API" "REST API, authentication, persistence, and hero synchronization." "Python 3.12, Django, DRF" {
                authenticationApi = component "Authentication API" "Handles registration and JWT authentication." "DRF, Simple JWT"
                heroApi = component "Hero API Views" "Provides public hero list and detail endpoints." "DRF"
                teamCompositionApi = component "Team Composition API" "Provides authenticated, user-scoped CRUD endpoints." "Django REST Framework" {
                    tags "HexAdapter"
                }

                serializers = component "API Serializers" "Validates payloads and maps API DTOs." "Django REST Framework" {
                    tags "HexAdapter"
                }
                teamCompositionService = component "Team Composition Service" "Coordinates team composition use cases." "Python" {
                    tags "HexCore"
                }
                domainModel = component "Domain Model" "Enforces unique-hero and 1-2-2 role rules." "Python dataclasses" {
                    tags "HexCore"
                }
                heroPort = component "Hero Port" "Defines the hero operations required by the core." "Python interface" {
                    tags "HexPort"
                }
                teamCompositionPort = component "Team Composition Port" "Defines user-scoped persistence operations." "Python interface" {
                    tags "HexPort"
                }
                externalHeroSourcePort = component "External Hero Source Port" "Defines the external hero operations required by the core." "Python interface" {
                    tags "HexPort"
                }
                heroDatabaseAdapter = component "Hero Database Adapter" "Implements the Hero Port using Django ORM." "Python, Django ORM" {
                    tags "HexAdapter"
                }
                teamCompositionDatabaseAdapter = component "Team Composition Database Adapter" "Implements the Team Composition Port using Django ORM." "Python, Django ORM" {
                    tags "HexAdapter"
                }

                heroSyncCommand = component "Hero Sync Command" "Starts synchronization when cached data is stale." "Django command" {
                    tags "HexAdapter"
                }
                heroSyncService = component "Hero Sync Service" "Coordinates fetching and storing hero data." "Python" {
                    tags "HexCore"
                }
                overfastApiAdapter = component "OverFast API Adapter" "Implements the external source port with timeout and retry." "Python, Requests" {
                    tags "HexAdapter"
                }
            }

            database = container "Database" "Stores users, heroes, and team compositions." "PostgreSQL 16" {
                tags "Database"
            }
        }

        externalHeroApi = softwareSystem "OverFast API" "Provides Overwatch hero data and statistics."

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
        owtu.backend.teamCompositionApi -> owtu.backend.teamCompositionService "Executes use cases through"
        owtu.backend.teamCompositionApi -> owtu.backend.teamCompositionDatabaseAdapter "Wires into the service"
        owtu.backend.teamCompositionApi -> owtu.backend.heroDatabaseAdapter "Wires into the service"

        owtu.backend.teamCompositionDatabaseAdapter -> owtu.backend.heroDatabaseAdapter "Loads referenced heroes through"
        owtu.backend.teamCompositionService -> owtu.backend.teamCompositionPort "Persists compositions through"
        owtu.backend.teamCompositionService -> owtu.backend.heroPort "Resolves selected heroes through"
        owtu.backend.teamCompositionService -> owtu.backend.domainModel "Creates and validates"
        owtu.backend.teamCompositionDatabaseAdapter -> owtu.backend.teamCompositionPort "Implements"
        owtu.backend.heroDatabaseAdapter -> owtu.backend.heroPort "Implements"
        owtu.backend.overfastApiAdapter -> owtu.backend.externalHeroSourcePort "Implements"
        owtu.backend.heroPort -> owtu.backend.domainModel "Uses"
        owtu.backend.teamCompositionPort -> owtu.backend.domainModel "Uses"
        owtu.backend.externalHeroSourcePort -> owtu.backend.domainModel "Uses"
        owtu.backend.heroDatabaseAdapter -> owtu.database "Reads and writes heroes and abilities" "Django ORM/SQL"
        owtu.backend.teamCompositionDatabaseAdapter -> owtu.database "Reads and writes user-owned team compositions" "Django ORM/SQL"

        owtu.backend.heroSyncCommand -> owtu.backend.heroSyncService "Starts"
        owtu.backend.heroSyncCommand -> owtu.backend.overfastApiAdapter "Wires into the service"
        owtu.backend.heroSyncCommand -> owtu.backend.heroDatabaseAdapter "Wires into the service"
        owtu.backend.heroSyncService -> owtu.backend.externalHeroSourcePort "Fetches heroes through"
        owtu.backend.heroSyncService -> owtu.backend.heroPort "Upserts heroes through"
        owtu.backend.overfastApiAdapter -> externalHeroApi "Fetches hero lists, details, and competitive statistics from" "JSON/HTTPS"
    }

    views {
        systemContext owtu "Context_Diagram" {
            include *
            autoLayout lr 200 100
            description "System context for OverwatchTeamUp."
        }

        container owtu "Container_Diagram" {
            include *
            autoLayout lr 150 90
            description "Runtime containers and external dependencies of OverwatchTeamUp."
        }

        component owtu.backend "Component_Diagram_Backend" {
            include *
            autoLayout tb 150 90
            description "Implemented components of the Django backend."
        }

        component owtu.backend "Component_Diagram_Backend_Presentation" {
            include owtu.frontend

            include owtu.backend.authenticationApi
            include owtu.backend.heroApi
            include owtu.backend.teamCompositionApi
            include owtu.backend.serializers
            include owtu.backend.heroSyncCommand

            include owtu.backend.teamCompositionService
            include owtu.backend.heroSyncService
            include owtu.backend.domainModel

            include owtu.backend.heroPort
            include owtu.backend.teamCompositionPort
            include owtu.backend.externalHeroSourcePort

            include owtu.backend.heroDatabaseAdapter
            include owtu.backend.teamCompositionDatabaseAdapter
            include owtu.backend.overfastApiAdapter

            include owtu.database
            include externalHeroApi

            exclude "owtu.frontend -> owtu.backend"
            exclude "owtu.backend -> owtu.database"
            exclude "owtu.backend -> externalHeroApi"

            exclude "owtu.backend.teamCompositionApi -> owtu.backend.teamCompositionDatabaseAdapter"
            exclude "owtu.backend.teamCompositionApi -> owtu.backend.heroDatabaseAdapter"
            exclude "owtu.backend.heroSyncCommand -> owtu.backend.overfastApiAdapter"
            exclude "owtu.backend.heroSyncCommand -> owtu.backend.heroDatabaseAdapter"

            exclude "owtu.backend.heroPort -> owtu.backend.domainModel"
            exclude "owtu.backend.teamCompositionPort -> owtu.backend.domainModel"
            exclude "owtu.backend.externalHeroSourcePort -> owtu.backend.domainModel"
            exclude "owtu.backend.teamCompositionDatabaseAdapter -> owtu.backend.heroDatabaseAdapter"

            description "Complete backend overview arranged left-to-right for a widescreen presentation."
        }

        component owtu.backend "Component_Diagram_Team_Composition" {
            include owtu.frontend
            include owtu.backend.teamCompositionApi
            include owtu.backend.serializers
            include owtu.backend.teamCompositionService
            include owtu.backend.domainModel
            include owtu.backend.heroPort
            include owtu.backend.teamCompositionPort
            include owtu.backend.heroDatabaseAdapter
            include owtu.backend.teamCompositionDatabaseAdapter
            include owtu.database
            autoLayout lr 100 90
            description "Team composition creation, validation, and persistence."
        }

        dynamic owtu.backend "Team_Composition_Secure_CRUD_Flow" {
            owtu.frontend.teamCompositionUi -> owtu.backend.teamCompositionApi "Authenticated request" "JSON/HTTPS"
            owtu.backend.teamCompositionApi -> owtu.backend.teamCompositionService "Validates and executes"
            owtu.backend.teamCompositionService -> owtu.backend.heroPort "Resolves heroes"
            owtu.backend.heroDatabaseAdapter -> owtu.backend.heroPort "Implements port"
            owtu.backend.heroDatabaseAdapter -> owtu.database "Reads hero data" "Django ORM/SQL"
            owtu.backend.teamCompositionService -> owtu.backend.domainModel "Enforces team rules"
            owtu.backend.teamCompositionService -> owtu.backend.teamCompositionPort "Loads or persists team"
            owtu.backend.teamCompositionDatabaseAdapter -> owtu.backend.teamCompositionPort "Implements port"
            owtu.backend.teamCompositionDatabaseAdapter -> owtu.database "Reads or writes user data" "Django ORM/SQL"
            description "Authenticated CRUD flow. Orange: adapters; green: core; purple: ports. Numbers indicate reading order."
        }

        component owtu.backend "Component_Diagram_Hero_Sync" {
            include owtu.backend.heroSyncCommand
            include owtu.backend.heroSyncService
            include owtu.backend.domainModel
            include owtu.backend.heroPort
            include owtu.backend.externalHeroSourcePort
            include owtu.backend.heroDatabaseAdapter
            include owtu.backend.overfastApiAdapter
            include owtu.database
            include externalHeroApi
            autoLayout lr 120 90
            description "Synchronization of hero data from OverFast into PostgreSQL."
        }

        dynamic owtu.backend "Hero_Data_External_API_Integration" {
            owtu.backend.heroSyncCommand -> owtu.backend.heroSyncService "Starts sync when cache is stale"
            owtu.backend.heroSyncService -> owtu.backend.externalHeroSourcePort "Requests hero data"
            owtu.backend.overfastApiAdapter -> owtu.backend.externalHeroSourcePort "Implements port"
            owtu.backend.overfastApiAdapter -> externalHeroApi "Fetches with timeout and retry" "JSON/HTTPS"
            owtu.backend.heroSyncService -> owtu.backend.heroPort "Upserts heroes"
            owtu.backend.heroDatabaseAdapter -> owtu.backend.heroPort "Implements port"
            owtu.backend.heroDatabaseAdapter -> owtu.database "Updates local cache" "Django ORM/SQL"
            description "Resilient hero synchronization. Orange: adapters; green: core; purple: ports. External systems remain neutral."
        }

        component owtu.frontend "Component_Diagram_Frontend" {
            include *
            autoLayout lr 400 200
            description "Current frontend prototype components on the frontend branch."
        }

        dynamic owtu.backend "Login_Flow" {
            owtu.frontend -> owtu.backend.authenticationApi "Submits username and password" "JSON/HTTPS"
            owtu.backend.authenticationApi -> owtu.database "Loads the user and verifies the password" "Django ORM/SQL"
            owtu.backend.authenticationApi -> owtu.frontend "Returns access and refresh tokens" "JSON/HTTPS"
            autoLayout lr 250 100
            description "Login flow using Django REST Framework Simple JWT."
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
            element "HexAdapter" {
                background #8A431F
                color #FFFFFF
                stroke #F47B20
                strokeWidth 7
                fontSize 26
            }
            element "HexCore" {
                background #244F35
                color #FFFFFF
                stroke #55AA55
                strokeWidth 7
                fontSize 26
            }
            element "HexPort" {
                background #513D70
                color #FFFFFF
                stroke #9B72CF
                strokeWidth 7
                fontSize 26
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
