    // Forma típica del estado
    // El estado suele organizarse como un árbol, dividido por "features" (dominios de tu app)

    interface AppState {
      auth: AuthState;      // ← esto apunta a otra interface
      clients: ClientsState; // ← esto también
      ui: UiState;
    }

    interface AuthState {
      user: User | null;
      loading: boolean;
      error: string | null;
    }

    // Cada "slice" (auth, clients, ui) se gestiona de forma independiente 
    // con su propio reducer, y luego se combinan en el estado global.

    // Cómo se instala e inyecta ////

    // app.config.ts (o app.module.ts si usas NgModules)
    import { provideStore } from '@ngrx/store';

    provideStore({
      auth: authReducer,
      clients: clientsReducer,
    })

    // Luego, en cualquier componente o servicio, inyectas el Store:

    /* 
    Store — es la clase que provee @ngrx/store (la librería). Es la que tiene los
    métodos .dispatch() y .select()

    AppState — es tu propia interface, la que 
    definiste tú mismo con la forma del árbol de estado (auth, clients, ui...). 
    Esta no viene de NgRx, la creas tú en tu proyecto */

    import { Component } from '@angular/core';
    import { Store } from '@ngrx/store';
    import { AppState } from './state/app.state'; // o donde tengas definida tu interface

    constructor(private store: Store<AppState>) {}

2. ¿Qué hace el <AppState>?

  /*  Es un generic de TypeScript. Le dice a Store qué forma tiene el estado que va a 
    manejar, para que TypeScript te dé autocompletado y chequeo de tipos cuando hagas: */

    this.store.select(state => state.auth.user); 
    // TS sabe que "state" es de tipo AppState,
    // y te avisa si "auth.user" no existe o el tipo está mal

    a. this.store.select(...)
    /*
    .select() es el método que usas para leer una parte del estado del Store.
    A diferencia de dispatch() (que envía datos), select() extrae datos y te los 
    devuelve como un Observable.
    */
    b.state => state.auth.user — es una función
    /*
    Esto es una arrow function que recibe el estado completo 
    (state, de tipo AppState) y devuelve solo la parte que te 
    interesa (state.auth.user). Es básicamente decirle a NgRx:

    "De todo el árbol de estado, dame solo esta rama específica"

    AppState
    ├── auth
    │   ├── user      ← esto es lo que estás pidiendo
    │   ├── loading
    │   └── error
    ├── clients
    └── ui

    state.auth.user navega el árbol: entra a la rama auth, y de ahí saca la propiedad user. */

    user$ = this.store.select(state => state.auth.user);

    /* Como es un Observable, no tiene el valor todavía — necesitas 
    suscribirte para obtenerlo. En el template, esto se hace normalmente 
    con el pipe async:
    */

    <div *ngIf="user$ | async as user">
      {{ user.name }}
    </div>

    /* El pipe async se suscribe automáticamente, te da el valor cuando 
    llega, y se desuscribe solo cuando el componente se destruye 
    (evitando memory leaks). */

3. Actions: cómo se disparan eventos
    /* 
    Las Actions son el único mecanismo para comunicarle algo al Store. Son objetos planos
    que describen qué pasó (no cómo debe cambiar el estado — eso lo decide el reducer). */


    // Anatomía de una Action

    // Toda Action tiene, como mínimo, una propiedad type:

    { type: '[Auth] Login Success' }

    //Y opcionalmente, un payload con datos adicionales:

    [Origen] Qué pasó


    { type: '[Auth] Login Success', user: { id: 1, name: 'Sebastian' } }


    import { createAction, props } from '@ngrx/store';

    export const loginSuccess = createAction(
      '[Auth API] Login Success',
      props<{ user: User }>()   // define el "shape" del payload
    );

    // loginSuccess es un Action Creator — una función. Al llamarla con datos,
    // genera el objeto Action:


    loginSuccess({ user: { id: 1, name: 'Sebastian' } })
    // → { type: '[Auth API] Login Success', user: { id: 1, name: 'Sebastian' } }

    // Si no necesitas payload:

    export const loadClients = createAction('[Clients Page] Load Clients');


    ///////////////////////////se instala en :

    // app.config.ts
    import { provideStore } from '@ngrx/store';
    import { AppState } from './store/app.state';
    import { authReducer } from './features/auth/store/auth.reducer';
    import { clientsReducer } from './features/clients/store/clients.reducer';

    export const appConfig: ApplicationConfig = {
      providers: [
        provideStore<AppState>({
          auth: authReducer,
          clients: clientsReducer,
        }),
      ],
    };

    /////////////////////////

4. Reducers: cómo cambia el estado

    // Cómo se escribe: createReducer + on()

    import { createReducer, on } from '@ngrx/store';
    import { loadClients, loadClientsSuccess, loadClientsFailure } from './clients.actions';

    export const initialState: ClientsState = {
      entities: [],
      loading: false,
      error: null,
    };

    export const clientsReducer = createReducer(
      initialState,

      on(loadClients, (state) => ({
        ...state,
        loading: true,
        error: null,
      })),

      on(loadClientsSuccess, (state, { clients }) => ({
        ...state,
        entities: clients,
        loading: false,
      })),

      on(loadClientsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
      }))
    );

    /* Un reducer es una función pura que recibe 
    el estado actual + una Action, y devuelve un nuevo estado. 
    Es el único lugar donde realmente se decide "cómo cambia" cada slice. */

    // flojo completo:

    // El flujo completo: botón → Action → Reducer → Store

    // 1. El estado (navigation.state.ts)
    
    export interface NavigationState {
      currentTenantId: string | null;
    }

    export const initialNavigationState: NavigationState = {
      currentTenantId: null,
    };

    // 2. La Action (navigation.actions.ts)
    
    import { createAction, props } from '@ngrx/store';

    export const setActiveTenant = createAction(
      '[Navigation] Set Active Tenant',
      props<{ tenantId: string }>()
    );

    // 3. El Reducer (navigation.reducer.ts)
    
    import { createReducer, on } from '@ngrx/store';
    import { setActiveTenant } from './navigation.actions';
    import { initialNavigationState } from './navigation.state';

    export const navigationReducer = createReducer(
      initialNavigationState, // -> l valor que va a tener(primera vez) esa rama del árbol antes de que ocurra cualquier Action,

      on(setActiveTenant, (state, { tenantId }) => ({
        ...state,
        currentTenantId: tenantId,
      }))
    );

    4. Registro en el Store (app.config.ts)
    
    import { provideStore } from '@ngrx/store';
    import { navigationReducer } from './store/navigation/navigation.reducer';

    export const appConfig: ApplicationConfig = {
      providers: [
        provideStore({
          navigation: navigationReducer,
        }),
      ],
    };

    5. El componente con el botón (tenant-selector.component.ts)
    
    import { Component } from '@angular/core';
    import { Store } from '@ngrx/store';
    import { AppState } from '../../store/app.state';
    import { setActiveTenant } from '../../store/navigation/navigation.actions';

    @Component({
      selector: 'app-tenant-selector',
      template: `
        <button (click)="selectTenant('empresaA')">Empresa A</button>
        <button (click)="selectTenant('empresaB')">Empresa B</button>
      `,
    })
    export class TenantSelectorComponent {
      constructor(private store: Store<AppState>) {}

      selectTenant(tenantId: string) {
        this.store.dispatch(setActiveTenant({ tenantId }));
      }
    }

    6. Otro componente que reacciona al cambio (nav-menu.component.ts)
    
    import { Component } from '@angular/core';
    import { Store } from '@ngrx/store';
    import { AppState } from '../../store/app.state';

    @Component({
      selector: 'app-nav-menu',
      template: `
        <p>Tenant activo: {{ currentTenantId$ | async }}</p>
      `,
    })
    export class NavMenuComponent {
      currentTenantId$ = this.store.select(state => state.navigation.currentTenantId);

      constructor(private store: Store<AppState>) {}
    }

5. Selectors: cómo leer el estado de forma eficiente

    // La solución: createSelector
   
    import { createFeatureSelector, createSelector } from '@ngrx/store';
    import { NavigationState } from './navigation.state';

    // 1. Selecciona el slice completo "navigation"
    export const selectNavigationState = createFeatureSelector<NavigationState>('navigation');

    // 2. Selecciona una propiedad específica DENTRO de ese slice
    export const selectCurrentTenantId = createSelector(
      selectNavigationState,
      (navState: NavigationState) => navState.currentTenantId
    );

    // Cómo se usa en el componente
   
    import { Store } from '@ngrx/store';
    import { AppState } from '../../store/app.state';
    import { selectCurrentTenantId } from '../../store/navigation/navigation.selectors';

    export class NavMenuComponent {
      currentTenantId$ = this.store.select(selectCurrentTenantId);

      constructor(private store: Store<AppState>) {}
    }

    Compáralo con lo que teníamos antes:

    // Antes (a mano)
    currentTenantId$ = this.store.select(state => state.navigation.currentTenantId);

    // Ahora (con selector reutilizable)
    currentTenantId$ = this.store.select(selectCurrentTenantId);


    --------------------------------------

    // Componiendo selectors (combinando varias fuentes)
    // Puedes combinar varios selectors como inputs:

    
    export const selectTenantSummary = createSelector(
      selectCurrentTenantId,
      selectClientsState,
      (tenantId, clientsState) => ({
        tenantId,
        totalClients: clientsState.entities.length,
      })
    );

    -------------------------------------------------

    // El único punto de entrada al slice "navigation"
    export const selectNavigationState = createFeatureSelector<NavigationState>('navigation');

    // Todo lo demás se deriva de ahí, directa o indirectamente
    export const selectCurrentTenantId = createSelector(selectNavigationState, s => s.currentTenantId);
    export const selectBreadcrumbs = createSelector(selectNavigationState, s => s.breadcrumbs);

    -------------------------------------------

6. Effects: manejo de side effects


  /*   cargar datos de una API, guardar en localStorage, mostrar notificaciones, navegar a otra
    ruta, etc. A todo esto se le llama side effects (efectos secundarios). */

    /* Los Effects son una librería aparte de NgRx que escucha las Actions que se despachan 
    (igual que los reducers), pero en vez de calcular estado, ejecuta código con efectos 
    secundarios — y opcionalmente, al terminar, despacha una nueva Action con el resultado. */

    // clients.effects.ts
    import { Injectable } from '@angular/core';
    import { Actions, createEffect, ofType } from '@ngrx/effects';
    import { catchError, map, mergeMap, of } from 'rxjs';
    import { ClientsService } from '../clients.service';
    import { loadClients, loadClientsSuccess, loadClientsFailure } from './clients.actions';

    @Injectable()
    export class ClientsEffects {
      loadClients$ = createEffect(() =>
        this.actions$.pipe(
          ofType(loadClients),
          mergeMap(() =>
            this.clientsService.getClients().pipe(
              map((clients) => loadClientsSuccess({ clients })),
              catchError((error) => of(loadClientsFailure({ error: error.message })))
            )
          )
        )
      );

      constructor(
        private actions$: Actions,
        private clientsService: ClientsService
      ) {}
    }

    Actions (inyectado como actions$)

    Es un Observable especial que emite cada Action que se despacha en toda la app — es
    como estar "escuchando" el flujo completo de dispatches, en tiempo real.

    ofType(loadClients)

    Filtra ese stream para quedarte solo con las Actions del tipo loadClients. 
    Ignora todas las demás.

    mergeMap(() => this.clientsService.getClients().pipe(...))

    Aquí ocurre el side effect real: llama al servicio 
    (ClientsService, que internamente hace HttpClient.get(...)). 
    mergeMap te permite "cambiar" de un Observable (actions$) a 
    otro (la llamada HTTP), y seguir la cadena con lo que devuelva.

    map((clients) => loadClientsSuccess({ clients }))

    Si la llamada HTTP fue exitosa, transforma el resultado en una nueva 
    Action: loadClientsSuccess. Esta Action nueva sale del Effect automáticamente.

    catchError((error) => of(loadClientsFailure({ error: error.message })))

    Si la llamada falla, en vez de romper el stream, atrapa el error y lo 
    convierte también en una Action (loadClientsFailure), envuelta 
    en of(...) porque catchError debe devolver un Observable.

    // el ClientsEffects efect se pone en el provider efect para su ejecucion
    
    
    // app.config.ts
    import { ApplicationConfig } from '@angular/core';
    import { provideStore } from '@ngrx/store';
    import { provideEffects } from '@ngrx/effects';
    import { ClientsEffects } from './features/clients/store/clients.effects';
    import { clientsReducer } from './features/clients/store/clients.reducer';

    export const appConfig: ApplicationConfig = {
      providers: [
        provideStore({
          clients: clientsReducer,
        }),
        provideEffects([ClientsEffects]),   // ← aquí se registra
      ],
    };


    /* Cuando la app arranca, provideEffects([ClientsEffects]) le dice a Angular/NgRx:

    Crea una instancia de ClientsEffects (usando el sistema de inyección de dependencias de Angular — por eso tiene @Injectable() y recibe actions$ y clientsService en su constructor)
    Inspecciona esa instancia, buscando todas las propiedades que fueron creadas con createEffect(...) — en este caso, encuentra loadClients$ (si hubiera más, como loadClientsSuccess$ para loggear, también las encontraría)
    Se suscribe automáticamente a cada una de esas propiedades encontradas
    Mantiene esas suscripciones vivas durante toda la vida de la aplicación */



7.(Integración de Effects con servicios) 

    /* Pasando parámetros de la Action al servicio

    Un caso muy común: la Action trae datos que el servicio necesita.
    Por ejemplo, cargar clientes filtrados por tenant: */



    // clients.actions.ts
    export const loadClientsByTenant = createAction(
      '[Clients Page] Load Clients By Tenant',
      props<{ tenantId: string }>()
    );

    // clients.effects.ts
    loadClientsByTenant$ = createEffect(() =>
      this.actions$.pipe(
        ofType(loadClientsByTenant),
        mergeMap(({ tenantId }) =>              // ← aquí SÍ desestructuras el payload
          this.clientsService.getClientsByTenant(tenantId).pipe(
            map((clients) => loadClientsSuccess({ clients })),
            catchError((error) => of(loadClientsFailure({ error: error.message })))
          )
        )
      )
    );

    // clients.service.ts
    getClientsByTenant(tenantId: string): Observable<Client[]> {
      return this.http.get<Client[]>(`${this.baseUrl}?tenantId=${tenantId}`);
    }


    reducers.

    export const clientsReducer = createReducer(
      initialState,

      on(loadClientsByTenant, (state) => ({
        ...state,
        loading: true,
        error: null,
      })),

      on(loadClientsSuccess, (state, { clients }) => ({
        ...state,
        entities: clients,
        loading: false,
      })),

      on(loadClientsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
      }))
    );


    /* Servicios que combinan varias llamadas

    A veces un Effect necesita el resultado de varias llamadas antes 
    de continuar. Ahí se combinan operadores de RxJS como forkJoin: */

    import { forkJoin } from 'rxjs';

    loadTenantDashboard$ = createEffect(() =>
      this.actions$.pipe(
        ofType(loadTenantDashboard),
        mergeMap(({ tenantId }) =>
          forkJoin({
            clients: this.clientsService.getClientsByTenant(tenantId),
            config: this.tenantService.getConfig(tenantId),
          }).pipe(
            map(({ clients, config }) => loadTenantDashboardSuccess({ clients, config })),
            catchError((error) => of(loadTenantDashboardFailure({ error: error.message })))
          )
        )
      )
    );

    /*  forkJoin espera a que todas las llamadas terminen, y te entrega
    los resultados juntos en un solo objeto. Útil cuando, por ejemplo,
    al cargar la vista de un tenant necesitas tanto sus clientes como
    su configuración al mismo tiempo. */


8. Organización por "feature modules" (state por dominio)


    // app.config.ts
    provideStore({
      auth: authReducer,
      clients: clientsReducer,
      navigation: navigationReducer,
    })

    Esto funciona bien con 3 slices, pero imagina un proyecto 
    multi-tenant con 15-20 features (clientes, facturación, reportes, 
    configuración, usuarios, permisos...). Registrar 
    todo en app.config.ts desde el arranque significa:

    Todo el estado se carga de inmediato, aunque el usuario nunca 
    visite esa sección
    app.config.ts se vuelve un archivo gigante y acoplado a 
    features que no debería conocer


    // app.config.ts — SOLO lo esencial, que se necesita desde el inicio
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(),              // ← Store vacío al inicio, sin slices predefinidos
    provideEffects([]),          // ← Effects globales, si los hay
  ],
};


// features/clients/clients.routes.ts
import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { clientsReducer } from './store/clients.reducer';
import { ClientsEffects } from './store/clients.effects';

export const CLIENTS_ROUTES: Routes = [
  {
    path: 'clients',
    providers: [
      provideState('clients', clientsReducer),
      provideEffects([ClientsEffects]),
    ],
    loadComponent: () => import('./clients-list.component').then(m => m.ClientsListComponent),
  },
];

Qué pasa con esto en la práctica
Mientras el usuario no navegue a /clients, el slice clients ni 
siquiera existe en el AppState
En el momento en que la ruta se activa, Angular ejecuta esos 
providers, y ahí recién se registra clientsReducer y se activa 
ClientsEffects
Si el usuario nunca visita esa sección, ese código 
(reducer, effects, y el estado que ocupan en memoria) 
nunca se carga

Esto es exactamente el mismo mecanismo de lazy loading que ya 
usas en Angular con rutas — solo que ahora también aplica al 
estado de NgRx.