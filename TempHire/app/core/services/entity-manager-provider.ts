import { Injectable} from '@angular/core';
import { 
    config, EntityManager, NamingConvention, DataService, DataType, MetadataStore,
    EntityType, NavigationProperty, DataProperty, EntityQuery, DataServiceConfig,
} from 'breeze-client';
import remove from 'lodash-es/remove';
import includes from 'lodash-es/includes';

// Import required breeze adapters. Rollup.js requires the use of breeze.base.debug.js, which doesn't include
// the breeze adapters. 
import 'breeze-client/adapters/adapter-data-service-webapi.umd';
import 'breeze-client/adapters/adapter-model-library-backing-store.umd';
import 'breeze-client/adapters/adapter-uri-builder-json.umd';
import 'breeze-client/adapters/adapter-uri-builder-odata.umd';

import { EntityTypeAnnotation } from '../entities/entity-type-annotation';
import { RegistrationHelper } from '../entities/registration-helper';


// The EntityManagerProvider manages a static master manager and a per instance sandbox manager.
@Injectable()
export class EntityManagerProvider {

    private static _preparePromise: Promise<any>;
    private static _masterManager: EntityManager;

    constructor() { }

    prepare(): Promise<any> {
        if (!EntityManagerProvider._preparePromise) {
            // Configure breeze adapaters. See rollup.js comment above
            config.initializeAdapterInstance('dataService', 'webApi');
            config.initializeAdapterInstance('uriBuilder', 'odata');
            NamingConvention.camelCase.setAsDefault();
            let dsconfig: DataServiceConfig = {
                serviceName: 'breeze'
            };
            if (location.port == '3000') {
                // Configure the json uriBuilder. See rollup.js comment above
                config.initializeAdapterInstance('uriBuilder', 'json', false);
                dsconfig.uriBuilderName = 'json'; // for breeze-sequelize server
            }
            let dataService = new DataService(dsconfig);

            let masterManager = EntityManagerProvider._masterManager = new EntityManager({
                dataService: dataService
            });
            return EntityManagerProvider._preparePromise = masterManager.fetchMetadata().then(() => {
                RegistrationHelper.register(masterManager.metadataStore);
                this.registerAnnotations(masterManager.metadataStore);

                // Load lockups
                var query = EntityQuery.from('lookups');
                return masterManager.executeQuery(query);
            }).catch(e => {
                // If there's an error, we need to ensure prepare can be called fresh
                EntityManagerProvider._preparePromise = null;
                throw e;
            });
        }

        return EntityManagerProvider._preparePromise;
    }

    reset(manager: EntityManager): void {
        if (manager) {
            manager.clear();
            this.seedManager(manager);
        }
    }

    newManager(): EntityManager {
        let manager = EntityManagerProvider._masterManager.createEmptyCopy();
        this.seedManager(manager);
        return manager;
    }

    private seedManager(manager: EntityManager) {
        manager.importEntities(EntityManagerProvider._masterManager.exportEntities(null, { asString: false, includeMetadata: false }));
    }

    private registerAnnotations(metadataStore: MetadataStore) {
        metadataStore.getEntityTypes().forEach((t: EntityType) => {
            let et = <EntityType>t;
            let ctor = <any>et.getCtor();
            if (ctor && ctor.getEntityTypeAnnotation) {
                let etAnnotation = <EntityTypeAnnotation>ctor.getEntityTypeAnnotation();
                et.validators.push(...etAnnotation.validators);
                etAnnotation.propertyAnnotations.forEach((pa) => {
                    let prop = et.getProperty(pa.propertyName);
                    prop.validators.push(...pa.validators);
                    prop.displayName = pa.displayName;
                });
            }
        });
    }
}

