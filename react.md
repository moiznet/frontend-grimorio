1. Fundamentos Clave de React
JSX y Renderizado: Cómo funciona JSX tras bambalinas (React.createElement) y renderizado condicional.

Componentes: Componentes funcionales vs. basados en clases (conceptos históricos y migración).

Props vs. State: Inmutabilidad del estado, propagación de datos hacia abajo (unidirectional data flow) y lifting state up.

Virtual DOM y Reconciliación: Algoritmo de Diffing, uso correcto de las keys en listas y por qué no usar el índice como key.

2. Hooks Esenciales y Avanzados
Básicos: useState (actualizaciones batch, funciones de actualización) y useEffect (ciclo de vida, array de dependencias y funciones de limpieza/cleanup).

Referencias y DOM: useRef para guardar valores mutables sin re-renderizar y para manipular nodos del DOM.

Optimización y Rendimiento: useMemo y useCallback (cuándo usarlos y evitar su sobreuso).

Hooks Secundarios: useReducer para lógica de estado compleja y useId / useLayoutEffect.

Custom Hooks: Extracción y reutilización de lógica de negocio en hooks personalizados.

3. Manejo de Estado Global y Flujo de Datos
Context API: Creación, consumo (useContext) y cómo evitar problemas de re-renderizado masivo con Context.

Librerías de Estado: Conceptos de Redux Toolkit (slices, dispatch, selectores) o Zustand (store centralizado y mutación inmutable).

Server State vs. Client State: Diferencia entre el estado local/UI y la caché del servidor.

4. Ruteo, Data Fetching y Asincronía
React Router (v6+): Configuración de rutas, rutas protegidas (Guards/PrivateRoutes), useNavigate, useParams y Outlet.

Data Fetching Eficiente: Manejo de estados (Cargando, Error, Éxito) usando fetch/axios o TanStack Query (React Query) (mutaciones, invalidación de caché).

Suspense y Lazy Loading: Code splitting con React.lazy para optimizar el bundle de entrada.

5. Patrones de Diseño y Arquitectura de Componentes
Patrones de React:

Container / Presentational Components

Compound Components (componentes compuestos)

Custom Hook Pattern

TypeScript con React: Tipado de props, eventos de React (React.MouseEvent, React.ChangeEvent), y tipos genéricos en componentes.

6. Pruebas Unutarias y Integración
Herramientas: Jest + React Testing Library (RTL).

Estrategia: Filosofía de RTL ("test components as the user interacts with them").

Mocks: Mockear llamadas a API (msw o jest.fn()), hooks y props.

7. Preguntas Frecuentes en Entrevistas Técnicas (Live Coding)
¿Por qué el estado no se actualiza inmediatamente después de llamar a setState?

¿Cuál es la diferencia entre useCallback y useMemo?

Cómo implementar un buscador con Debounce utilizando useEffect y un Custom Hook.

Crear un componente de paginación o scroll infinito sin librerías externas.