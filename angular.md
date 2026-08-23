# 📚 Guía Completa y Temario Consolidado: Angular Moderno & RxJS

---
yy
## 📌 1. Arquitectura y Componentes

* **Standalone Components vs. NgModules (Angular 14+):**
  * Uso de `standalone: true` en el decorador `@Component`.
  * Ya no es obligatorio declarar componentes en un `NgModule`. Se importan directamente las dependencias requeridas en el arreglo `imports: [...]` del componente.
* **Ciclo de Vida (Lifecycle Hooks):**
  * `ngOnInit`: Inicialización lógica tras cargar las entradas.
  * `ngOnChanges`: Se ejecuta cuando cambia una propiedad `@Input()` (recibe un objeto `SimpleChanges`).
  * `ngAfterViewInit`: El DOM del componente y sus vistas hijas ya están renderizados.
  * `ngOnDestroy`: Limpieza activa (desuscripciones de RxJS, cancelación de timers/intervalos).
* **Binding en Plantilla:**
  * **Interpolación:** `{{ valor }}`
  * **Propiedad:** `[propiedad]="valor"`
  * **Evento:** `(evento)="ejecutarFuncion()"`
  * **Two-way Data Binding:** `[(ngModel)]="valor"`

---

## 📌 2. Comunicación entre Componentes

* **Padre ➔ Hijo:**
  * Sintaxis Tradicional: `@Input() data: string;`
  * API Moderna (Signals): `data = input.required<string>();`
* **Hijo ➔ Padre:**
  * Sintaxis Tradicional: `@Output() evento = new EventEmitter<string>();`
  * API Moderna (Signals): `evento = output<string>();`
* **Acceso Directo a la Vista/DOM:**
  * `@ViewChild(MiComponenteHijo)` / `@ViewChild('referenciaLocal')` para acceder a elementos de la plantilla o componentes hijos tras `ngAfterViewInit`.
* **Entre Componentes no Relacionados:**
  * A través de un Servicio Singleton (`providedIn: 'root'`) usando un `BehaviorSubject` o `Signals`.

---

## 📌 3. Inyección de Dependencias (DI)

* **Decorador `@Injectable({ providedIn: 'root' })`:**
  * Registra el servicio como **Singleton** (instancia única para toda la app).
  * Habilita el **Tree-shaking**: Si el servicio no se utiliza en ningún lugar, el empaquetador lo elimina del paquete JS final.
* **Formas de Inyección:**
  * *Constructor (Clásico):* `constructor(private myService: MyService) {}`
  * *Función `inject()` (Angular 14+ / Recomendado):* `private myService = inject(MyService);`

---

## 📌 4. Directivas y Pipes

* **Control Flow en Plantilla:**
  * *Tradicional:* Directivas estructurales `*ngIf`, `*ngFor`, `*ngSwitch`.
  * *Sintaxis Moderna (Angular 17+):* Bloques `@if`, `@for (item of items; track item.id)`, `@switch`.
* **Directivas de Atributo Reutilizables:** `ngClass`, `ngStyle`.
* **Pipes:**
  * Transforman datos directamente en la plantilla (`{{ precio | currency:'USD' }}`).
  * **Pure Pipe:** Se ejecuta **únicamente** cuando cambia la referencia del argumento de entrada (optimización de rendimiento/memorización).
  * **Impure Pipe:** Se ejecuta en **cada ciclo de detección de cambios** (usar con precaución por impacto en rendimiento).

---

## 📌 5. Reactividad con RxJS: Fundamentos & Subjects

* **Observable vs. Promise:** El Observable es perezoso (*lazy*, no se ejecuta hasta suscribirse), emite múltiples valores a lo largo del tiempo y se puede cancelar (`unsubscribe`).
* **Naturaleza del Subject:** Actúa como `Observable` y `Observer`. Es **Multicast** (compartido entre múltiples suscriptores).
  * **`Subject`:** No guarda memoria. Los suscriptores solo reciben eventos emitidos *después* de suscribirse.
  * **`BehaviorSubject`:** Requiere un valor inicial obligatorio. Guarda el último valor emitido y lo entrega de inmediato a cualquier nuevo suscriptor. Permite lectura síncrona mediante `.getValue()`.
  * **`ReplaySubject`:** Almacena un búfer de N últimos valores y los "reproduce" todos a los nuevos suscriptores.

---

## 📌 6. Operadores de RxJS y Aplanamiento (*Flattening*)

* **Mecanismo de `.pipe()`:** Ensamblador secuencial que canaliza el flujo de datos a través de operadores de transformación/filtrado sin modificar la fuente original.
* **Operadores de Creación:**
  * `of([1, 2, 3])`: Emite el elemento completo tal cual como un único valor y completa.
  * `from([1, 2, 3])`: Itera sobre la estructura y emite elemento por elemento.
* **Operadores de Aplanamiento:**
  * **`switchMap`:** Cancela la petición anterior en vuelo si llega un nuevo valor. *(Caso: Buscadores / Autocompletado)*.
  * **`mergeMap`:** Ejecuta todas las peticiones en paralelo sin cancelar ni ordenar. *(Caso: Subida masiva de archivos)*.
  * **`concatMap`:** Encola las peticiones y las ejecuta secuencialmente en orden estricto. *(Caso: Transacciones o escrituras dependientes)*.
  * **`exhaustMap`:** Ignora/descarta nuevos eventos hasta que la petición activa complete. *(Caso: Botones de Pago / Evitar doble clic)*.
* **Manejo de Errores:**
  * `catchError`: Atrapa excepciones en el flujo y permite retornar un Observable seguro (ejemplo: `of([])`).

---

## 📌 7. El `AsyncPipe` y Gestión de Memoria

* **Funcionamiento del `AsyncPipe`:** Administra automáticamente el ciclo de vida del Observable: ejecuta `.subscribe()` al renderizar y `.unsubscribe()` al destruir el componente.
* **Cold Observables & Múltiples Suscripciones:**
  * *Problema:* Usar `{{ user$ | async }}` múltiples veces en la plantilla ejecuta una suscripción por cada uso, disparando múltiples peticiones HTTP idénticas a la red.
  * *Solución 1 (HTML):* Sintaxis `@if (user$ | async; as user)` para realizar una sola suscripción local.
  * *Solución 2 (TS):* Pipear el Observable con `shareReplay(1)` para volverlo *Hot* y compartir el caché entre suscriptores.
* **Prevención de Fugas de Memoria (*Memory Leaks*):**
  1. Usar `AsyncPipe` en plantillas HTML.
  2. Usar `takeUntilDestroyed()` (Angular 16+) en el contexto de inyección del TS.
  3. Usar `take(1)` para operaciones de emisión única.
  4. Patrón `takeUntil(destroy$)` con `Subject` en `ngOnDestroy` (código legacy).

---

## 📌 8. Enrutamiento, Lazy Loading & Guards Funcionales

* **Lazy Loading de Rutas:**
  ```typescript
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  }
Guards Funcionales (CanActivateFn):

TypeScript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated() ? true : inject(Router).createUrlTree(['/login']);
};
Component Input Binding:

Configuración en app.config.ts: provideRouter(routes, withComponentInputBinding()).

Recibe parámetros de URL (/user/:id) directamente como inputs: id = input<string>();.

📌 9. Rendimiento y Optimización (Performance)
ChangeDetectionStrategy.OnPush: Ignora los chequeos del subárbol salvo que cambie la referencia de un @Input()/input(), se emita un evento local, o cambie un Signal/AsyncPipe.

Carga Perezosa con @defer (Angular 17+):

HTML
@defer (on viewport) {
  <app-heavy-chart [data]="data" />
} @placeholder {
  <p>Scroll para cargar</p>
}
Optimizaciones de Plantilla: Evitar llamadas a funciones directas en las expresiones {{ getValor() }}. Reemplazar por Pipes Puros o Signals (computed).

📌 10. Formularios Reactivos Fuertemente Tipados
Clases Clave: FormGroup, FormControl, FormArray, FormBuilder.

Tipado Estricto (Angular 14+):

TypeScript
loginForm = inject(FormBuilder).group({
  email: inject(FormBuilder).nonNullable.control('', [Validators.required, Validators.email]),
  password: inject(FormBuilder).nonNullable.control('', [Validators.required])
});
setValue() vs patchValue():

setValue() exige el objeto con la estructura exacta y completa.

patchValue() permite actualizaciones parciales de controles.

Validadores Personalizados:

Síncronos: Retornan ValidationErrors | null.

Asíncronos: Retornan Observable<ValidationErrors | null> o Promise.

Diferencia con Template-Driven: Reactive Forms manejan la lógica en TS, son inmutables, basados en flujos reactivos y mucho más fáciles de testear.

📌 11. Directivas Personalizadas
Atributos y Eventos del Host:

Sintaxis Moderna (Angular 17+):

TypeScript
@Directive({
  selector: '[appHighlight]',
  standalone: true,
  host: {
    '[style.backgroundColor]': 'bgColor',
    '(mouseenter)': 'onMouseEnter()'
  }
})
Sintaxis Tradicional: Decoradores @HostBinding() y @HostListener().

Inclusión en Standalone: Se registran en el arreglo imports: [HighlightDirective] del componente.

Directivas Compuestas (hostDirectives): Permiten aplicar comportamientos de directivas a componentes enteros desde su metadata de TS.

# 📌 12. Angular Signals & Reactividad Moderna (Angular 16+)

* **Sintaxis Básica:**
  * Declaración: `private _count = signal<number>(0);`
  * Lectura: `const c = this._count();` (se invoca como función)
  * Modificación: `this._count.set(5)` o `this._count.update(v => v + 1);`
  * Solo lectura: `count = this._count.asReadonly();`
* **Valores Derivados y Efectos:**
  * `doubleCount = computed(() => this._count() * 2);` (memorizado y de solo lectura).
  * `effect(() => console.log('El contador cambió a:', this._count()));` (ejecuta efectos secundarios).
* **Signals vs BehaviorSubject / RxJS:**
  * Signals manejan el estado síncrono del componente sin suscripciones manuales, sin `unsubscribe` y sin pipe `async`.
  * Ofrecen reactividad fina (*fine-grained reactivity*) independiente de Zone.js.
  * RxJS se mantiene para la gestión de flujos asíncronos complejos y peticiones HTTP (`toSignal()` y `toObservable()` conectan ambos mundos).

📌 13. Pruebas Unitarias (Testing)
Herramientas Principales: TestBed (entorno ejecutor), ComponentFixture (wrapper del componente y DOM), jasmine.createSpyObj / spyOn (interceptores y mocks).

Aislamiento de Servicios: Inyección de mocks mediante los proveedores de TestBed:

TypeScript
{ provide: UserService, useValue: userServiceSpy }
Manejo Asíncrono:

fixture.detectChanges(): Ejecuta manualmente el ciclo de detección de cambios en el test.

fakeAsync + tick(ms): Controla y adelanta el tiempo en operaciones asíncronas de forma síncrona.

Pruebas de HttpClient: Utilización de HttpTestingController para verificar peticiones salientes y responder con req.flush(mockData).

🎯 Preguntas Rápidas de Repaso para Entrevista
¿Qué diferencia a un BehaviorSubject de un Signal?

Respuesta: Ambos manejan estado con valor inicial, pero Signal es un primitivo propio del framework que no requiere suscripciones, no sufre por fugas de memoria y no necesita el pipe async.

¿Por qué switchMap es ideal para buscadores pero no para subir archivos?

Respuesta: Porque switchMap cancela la petición anterior cuando llega un nuevo valor. En un buscador esto ahorra recursos cancelando búsquedas obsoletas, pero en una subida de archivos cancelaría las cargas en curso.

¿Cómo se resuelve el problema de múltiples llamadas HTTP generadas por el AsyncPipe?

Respuesta: Usando la sintaxis @if (obs$ | async; as data) en la plantilla o aplicando el operador shareReplay(1) en el archivo TypeScript para volver el Observable Hot.

¿Cuál es la ventaja de providedIn: 'root' en un servicio?

Respuesta: Crea una instancia única (Singleton) disponible globalmente y permite el Tree-shaking (si el servicio no se usa, no se incluye en el paquete JS final).

/* Las versiones 14, 16 y 17 son los tres pilares del cambio estructural en Angular:

 
Angular 13+: property binding nativo de clases y estilos sin necesidad de importar.

Angular 14: Componentes Standalone (despedida progresiva a los NgModules) y Typed Forms.

Angular 16: Nacimiento de Signals, la función inject() como estándar y el puente @angular/core/rxjs-interop.

Angular 17: Nuevo Control Flow (@if, @for), bloques @defer y compilación rápida con Esbuild/Vite. */
