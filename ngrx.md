1. Qué es NgRx

Componente → dispara Action → Reducer procesa → Store actualiza → Componente reacciona

Visualmente:
Un componente dispara una Action (ej: "usuario hizo clic en guardar")
Esa Action llega a un Reducer, una función pura que calcula el nuevo estado
El Store se actualiza con ese nuevo estado
Los componentes suscritos (vía Selectors) reaccionan automáticamente al cambio

Este ciclo es siempre en una sola dirección


2. El store 
El Store es el corazón de NgRx: un objeto único e inmutable que contiene todo el estado de tu aplicación.

Es un observable: te suscribes a él (normalmente a través de selectors
Es inmutable: nunca se modifica directamente. Cada cambio genera un nuevo objeto de estado, no se mutan las propiedades existentes
Es la única fuente de verdad: si un dato importa para más de un componente, debería vivir aquí (no en un servicio con variables sueltas)


user$ = this.store.select(state => state.auth.user);

Como es un Observable, no tiene el valor todavía — necesitas suscribirte para obtenerlo. En el template, esto se hace normalmente con el pipe async:

html
<div *ngIf="user$ | async as user">
  {{ user.name }}
</div>

El pipe async se suscribe automáticamente, te da el valor cuando llega, y se desuscribe solo cuando el componente se destruye (evitando memory leaks).

user$ = this.store.select(state => state.auth.user);

<div *ngIf="user$ | async as user">
  {{ user.name }}
</div>

¿Por qué es un Observable y no un valor plano?

Porque el estado puede cambiar en cualquier momento (alguien hace dispatch de una acción, el reducer actualiza auth.user). Al ser un Observable, cada vez que esa parte del estado cambie, automáticamente emite el nuevo valor y tu componente se actualiza solo — sin que tengas que hacer polling ni refrescar manualmente.

Analogía

Piensa en .select() como suscribirte a un canal de YouTube específico dentro de una plataforma gigante (el Store). No te suscribes a "toda la plataforma", solo al canal (auth.user) que te interesa. Cada vez que ese canal sube contenido nuevo (el estado cambia), te llega la notificación automáticamente.

Nota importante (conecta con el punto 5)

Escribir el selector "a mano" así (state => state.auth.user) funciona, pero no es la forma recomendada en proyectos reales. Lo ideal es usar Selectors con createSelector, que son más reutilizables y están optimizados con memoización (no recalculan si el estado no cambió). Esto es justamente el punto 5 del temario.


El "árbol" no es una sola interface — es la composición de varias interfaces anidadas unas dentro de otras. AppState es la raíz, y cada una de sus propiedades (auth, clients, ui) apunta a otra interface que define esa rama. Cuando TypeScript resuelve los tipos, el árbol real que se forma es:


AppState  (raíz)
│
├── auth: AuthState
│         ├── user: User | null
│         ├── loading: boolean
│         └── error: string | null
│
├── clients: ClientsState
│         └── (sus propias propiedades)
│
└── ui: UiState
          └── (sus propias propiedades)


3. Actions: cómo se disparan eventos

Convención de nombres: [Source] Event

NgRx recomienda una convención muy específica para el type:

[Origen] Qué pasó

Ejemplos reales:

[Login Page] Login
[Auth API] Login Success
[Auth API] Login Failure
[Clients Page] Load Clients

El origen ([Login Page], [Auth API]) te dice de dónde vino la Action — muy útil cuando debuggeas con Redux DevTools y ves 50 acciones en el historial: de inmediato sabes si vino de un componente, de un efecto, de una API, etc.

[Origen] Qué pasó

import { createAction, props } from '@ngrx/store';

export const loginSuccess = createAction(
  '[Auth API] Login Success',
  props<{ user: User }>()   // define el "shape" del payload
);

NgRx recomienda una convención muy específica para el type:

[Origen] Qué pasó

Ejemplos reales:

[Login Page] Login
[Auth API] Login Success
[Auth API] Login Failure
[Clients Page] Load Clients

----------------------------------------------------------

No hay una regla obligatoria de NgRx sobre el nombre del archivo, pero sí hay una convención bastante estándar en proyectos Angular grandes. Te explico la estructura típica:

Ubicación típica
src/app/
├── store/                      ← carpeta raíz del store global
│   ├── app.state.ts            ← aquí se define AppState
│   └── index.ts                ← (opcional) re-exporta todo
├── features/
│   ├── auth/
│   │   └── store/
│   │       ├── auth.state.ts       ← define AuthState
│   │       ├── auth.actions.ts
│   │       ├── auth.reducer.ts
│   │       └── auth.selectors.ts
│   └── clients/
│       └── store/
│           ├── clients.state.ts
│           ├── clients.actions.ts
│           ├── clients.reducer.ts
│           └── clients.selectors.ts



----------------------------------------------------------------------------

"Hay una función reducer pura por dominio/slice, y esas funciones se registran (no instancian) en provideStore, que internamente las combina en un único reducer raíz que gestiona el árbol completo."


----------------------------------------

4. Reducers: cómo cambia el estado

Un reducer es una función pura que recibe el estado actual + una Action, y devuelve un nuevo estado. Es el único lugar donde realmente se decide "cómo cambia" cada slice.

¿Qué significa "función pura"?

Dos reglas estrictas:

Mismo input → mismo output, siempre. No depende de nada externo (no llama APIs, no usa Math.random(), no lee variables globales)
No muta nada. No modifica el estado que recibe — siempre devuelve un objeto nuevo

// ❌ INCORRECTO - muta el estado
function badReducer(state, action) {
  state.user = action.user; // mutación directa, prohibido
  return state;
}

// ✅ CORRECTO - devuelve un objeto nuevo
function goodReducer(state, action) {
  return { ...state, user: action.user };
}

-----------------------------------------

Siguiendo la estructura que vimos antes, esto viviría en:

features/navigation/store/
├── navigation.state.ts
├── navigation.actions.ts
├── navigation.reducer.ts
└── navigation.selectors.ts   ← aquí van los selectors


Botón click → dispatch(action) → reducer calcula nuevo state
                                            ↓
                                     Store se actualiza
                                            ↓
                          selector detecta cambio en su slice
                                            ↓
                    componente suscrito (vía .select(selector)) recibe el nuevo valor

--------------------------------------------------
4: los reducers deben ser funciones puras. Si metieras una llamada HTTP dentro de un reducer, estarías rompiendo esa regla — ya no sería predecible ni testeable de la misma forma.


----------------------------------------------------------
EFECTS----

App arranca
    ↓
provideEffects([ClientsEffects]) se ejecuta
    ↓
Angular crea una instancia de ClientsEffects (inyecta Actions y ClientsService)
    ↓
NgRx encuentra la propiedad loadClients$ dentro de esa instancia
    ↓
NgRx se suscribe automáticamente a loadClients$
    ↓
(la app sigue corriendo normalmente)
    ↓
... en algún momento, un componente hace: dispatch(loadClients())
    ↓
Esa Action llega a actions$ → pasa el ofType() → dispara todo el flujo del Effect
    ↓
Cuando loadClients$ emite la Action resultante (Success o Failure)
    ↓
NgRx (que ya estaba suscrito desde el arranque) hace dispatch() de esa Action automáticamente


----------------------

servicios en efects

¿Por qué separar el servicio del Effect?
Responsabilidad única: el servicio sabe cómo hablar con el backend (endpoints, headers, transformación de datos crudos). El Effect solo sabe cuándo llamarlo y qué Action producir con el resultado
Reutilización: el mismo ClientsService.getClients() lo puedes usar en un Effect, en un componente sin NgRx, en un resolver de rutas, etc. — no está "atado" a NgRx
Testing más simple: puedes testear el Effect mockeando el servicio (sin necesidad de simular HTTP real), y por separado testear el servicio con HttpClientTestingModule


Manejo de errores a nivel de servicio (opcional, pero recomendable)

A veces conviene que el propio servicio transforme errores HTTP crudos en algo más manejable, antes de que lleguen al Effect:

typescript
// clients.service.ts
getClients(): Observable<Client[]> {
  return this.http.get<Client[]>(this.baseUrl).pipe(
    catchError((error: HttpErrorResponse) => {
      const mensaje = error.status === 404
        ? 'No se encontraron clientes'
        : 'Error al cargar clientes';
      return throwError(() => new Error(mensaje));
    })
  );
}

Así, el catchError del Effect recibe un error ya más "amigable", en vez de tener que interpretar códigos HTTP crudos ahí mismo.