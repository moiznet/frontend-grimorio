// Los hooks son métodos que Angular ejecuta en momentos específicos de la vida de un componente, desde que se crea hasta que se destruye.

// Aquí los tienes ordenados de principio a fin:

// Constructor ➔ ngOnChanges ➔ ngOnInit ➔ ngDoCheck ➔ ngAfterViewInit ➔ ngOnDestroy

/* 0. Constructor
1. ngOnChanges (si hay propiedades @Input)
2. ngOnInit
3. ngDoCheck
4. ngAfterContentInit
5. ngAfterContentChecked
6. ngAfterViewInit
7. ngAfterViewChecked
Cada vez que el valor de @Input() counter cambia desde el componente padre, la secuencia de actualización es:
ngOnChanges
ngDoCheck
ngAfterContentChecked
ngAfterViewChecked
Y cuando el componente se destruye (por ejemplo, con un *ngIf="false"):
8. ngOnDestroy */


/* Si te piden agruparlos por su uso práctico:

Inicialización y datos: ngOnInit para cargas de 
datos de backend/servicios y ngOnChanges para reaccionar a datos provenientes del padre.

Acceso al DOM: ngAfterViewInit cuando necesitas interactuar 
directamente con elementos HTML usando @ViewChild.

Limpieza y rendimiento: ngOnDestroy para desuscribir Observables o timers y evitar fugas de memoria.
 */
// Innovación reciente (Angular 16+)
// En versiones recientes, la función takeUntilDestroyed() limpia automáticamente las
// suscripciones en el momento en que se ejecuta ngOnDestroy sin que tengas que implementarlo
//  manualmente


// 1. Componente Hijo (contador.component.ts)
// El hijo solo se encarga de emitir el evento con @Output():

// TypeScript
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-contador',
  standalone: true,
  template: `
    <button (click)="incrementar()">Incrementar</button>
  `
})
export class ContadorComponent {
  @Input() count: number = 0;
  // Creamos el evento que emitirá un número
  @Output() cambioDeValor = new EventEmitter<number>();

  incrementar() {
    this.count++;
    // Emitimos el nuevo valor hacia el padre
    this.cambioDeValor.emit(this.count);
  }
}
// 2. Componente Padre (padre.component.ts)
// En la plantilla del padre capturas el evento con (cambioDeValor)="miFuncionPadre($event)":

// TypeScript
@Component({
  selector: 'app-padre',
  standalone: true,
  imports: [ContadorComponent],
  template: `
    <h2>Componente Padre</h2>
    <!-- Escuchamos el evento del hijo y pasamos $event a la función -->
    <app-contador (cambioDeValor)="alCambiarValor($event)"></app-contador>
  `
})
export class PadreComponent {
  
  // Esta función se ejecuta CADA VEZ que el hijo emite el evento
  alCambiarValor(nuevoValor: number) {
    console.log('El hijo emitió un nuevo valor:', nuevoValor);
    // Aquí puedes ejecutar la lógica que necesites en el padre:
    // Petición HTTP, guardar en BD, logs, etc.
  }
}


/* 
¿En qué casos es mejor usar Reactive Forms (formControlName) en vez de [(ngModel)]?

R: [(ngModel)] es ideal para formularios sencillos o inputs aislados. Para formularios
complejos, dinámicos o con validaciones personalizadas avanzadas, se prefieren los 
Reactive Forms (ReactiveFormsModule).
 */

// @input & @output

// Tradiconal (@Input):
// // Componente Hijo
// @Input() userId!: string;


// Moderno con Signals (Angular 17+):
// // Componente Hijo
// userId = input.required<string>(); // O `input('valorPorDefecto')`



// Tradicional (@Output):

// // Componente Hijo
// @Output() userSelected = new EventEmitter<User>();
// onSelect(user: User) {
//   this.userSelected.emit(user);
// }


// Moderno (Angular 17+):
// // Componente Hijo
// userSelected = output<User>();



@Component({...})
export class PadreComponent implements AfterViewInit {
  // Accedemos a la instancia del componente hijo
  @ViewChild(HijoComponent) hijoComp!: HijoComponent;

  ngAfterViewInit() {
    // Podemos llamar a un método del hijo directamente
    this.hijoComp.ejecutarMetodoHijo();
  }
}



// servicio

// Paso 1: El Servicio Singleton (data.service.ts)
// Aquí vive la variable compartida en memoria.

// TypeScript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' }) // 👈 'root' significa que es Singleton (1 sola instancia global)
export class DataService {

  // 1. BehaviorSubject guarda el valor actual y notifica cuando cambia.
  // Es privado para que nadie fuera del servicio modifique la emisora directamente.
  private mensajeSubject = new BehaviorSubject<string>('Mensaje Inicial');

  // 2. Lo exponemos como Observable público (solo lectura).
  mensaje$ = this.mensajeSubject.asObservable();

  // 3. Método para que CUALQUIER componente EMITA un nuevo valor.
  actualizarMensaje(nuevoMensaje: string) {
    this.mensajeSubject.next(nuevoMensaje); // .next() publica el dato en la emisora
  }
}
// Paso 2: Componente A (El que EMITE el cambio)
// El Componente A inyecta el servicio y llama a actualizarMensaje().

 
import { Component, inject } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-componente-a',
  standalone: true,
  template: `
    <button (click)="enviarDato()">Enviar desde Componente A</button>
  `
})
export class ComponenteA {
  private dataService = inject(DataService); // Inyectamos el servicio

  enviarDato() {
    // 📢 EMITIR: Llamamos al método del servicio
    this.dataService.actualizarMensaje('¡Hola desde el Componente A!');
  }
}
// Paso 3: Componente B (El que RECIBE el cambio)
// El Componente B también inyecta el mismo servicio y se suscribe al Observable mensaje$.

 
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from './data.service';

@Component({
  selector: 'app-componente-b',
  standalone: true,
  template: `
    <h3>Componente B dice: {{ mensajeRecibido }}</h3>
  `
})
export class ComponenteB implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  
  mensajeRecibido: string = '';
  private sub!: Subscription;

  ngOnInit() {
    // 🎧 RECIBIR: Nos suscribimos al Observable.
    // Cada vez que Componente A haga .next(), este bloque de código se ejecutará solo.
    this.sub = this.dataService.mensaje$.subscribe(texto => {
      this.mensajeRecibido = texto;
    });
  }

  ngOnDestroy() {
    // Siempre limpiamos la suscripción al destruir el componente
    this.sub.unsubscribe();
  }
}
// ⚡ Enfoque Moderno (Con Async Pipe en el HTML)
// Para no tener que usar .subscribe() ni manejar el ngOnDestroy() manualmente en el Componente B, en Angular se usa el async pipe directamente en la plantilla HTML:

 
@Component({
  selector: 'app-componente-b',
  standalone: true,
  imports: [AsyncPipe], // Importamos AsyncPipe
  template: `
    <!-- El pipe 'async' se suscribe y desuscribe automáticamente -->
    <h3>Componente B dice: {{ dataService.mensaje$ | async }}</h3>
  `
})
export class ComponenteB {
  public dataService = inject(DataService); // Inyectamos como público para usar en HTML
}


// El Mismo Servicio Compartido, pero con Signals
// 1. El Servicio Singleton (data.service.ts)
// En lugar de BehaviorSubject, usamos la función signal() de @angular/core.

 
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' }) // Singleton
export class DataService {

  // 1. Creamos un Signal privado con el valor inicial
  private _mensaje = signal<string>('Mensaje Inicial');

  // 2. Exponemos el Signal como SOLO LECTURA para los componentes (asReadonly)
  mensaje = this._mensaje.asReadonly();

  // 3. Método para actualizar el valor desde cualquier componente
  actualizarMensaje(nuevoTexto: string) {
    this._mensaje.set(nuevoTexto); // Usa .set() para cambiar el valor
  }
}
// 2. Componente A (El que EMITE/Cambia el valor)
 
import { Component, inject } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-componente-a',
  standalone: true,
  template: `
    <button (click)="cambiarDato()">Enviar desde Componente A</button>
  `
})
export class ComponenteA {
  private dataService = inject(DataService);

  cambiarDato() {
    // Actualizamos el Signal mediante el método del servicio
    this.dataService.actualizarMensaje('¡Hola con Signals!');
  }
}
// 3. Componente B (El que RECIBE/Muestra el valor)
// ¡Aquí es donde brilla Signals! Cero suscripciones, cero async pipe, cero ngOnDestroy.

 
import { Component, inject } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-componente-b',
  standalone: true,
  template: `
    <!-- Se invoca como función con paréntesis () en el HTML -->
    <h3>Componente B dice: {{ dataService.mensaje() }}</h3>
  `
})
export class ComponenteB {
  // Inyectamos el servicio
  public dataService = inject(DataService);
}



// 'Formas de inyectar:

// Vía constructor: constructor(private myService: MyService) {}

// Vía función inject() (Angular 14+): private myService = inject(MyService); (anterior)<'

// 💻 Ejemplo Completo: Vía Constructor
// 1. El Servicio (logger.service.ts)
// TypeScript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  log(mensaje: string): void {
    console.log(`[LOG]: ${mensaje}`);
  }
}
// 2. El Componente que inyecta por Constructor (usuario.component.ts)
// TypeScript
// import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-usuario',
  standalone: true,
  template: `<h2>Componente de Usuario</h2>`
})
export class UsuarioComponent implements OnInit {

  // 👈 INYECCIÓN DE DEPENDENCIA VÍA CONSTRUCTOR
  // Al poner 'private', TypeScript crea automáticamente la propiedad en la clase.
  constructor(private loggerService: LoggerService) {}

  ngOnInit(): void {
    // Usamos el servicio inyectado
    this.loggerService.log('El componente Usuario se ha inicializado.');
  }
}



/* Condicionales: @if / @else
Sintaxis Moderna (Angular 17+):

HTML
@if (isLoggedIn) {
  <p>Bienvenido de nuevo</p>
} @else if (isGuest) {
  <p>Modo Invitado</p>
} @else {
  <p>Por favor, inicia sesión</p>
}
Diferencia vs *ngIf: No requiere importar NgIf ni CommonModule, es más legible y genera menos código en el JS final.

B. Bucles: @for y su cláusula obligatoria track
Sintaxis Moderna (Angular 17+):

HTML
<ul>
  @for (user of users; track user.id) {
    <li>{{ user.name }}</li>
  } @empty {
    <li>No hay usuarios para mostrar</li>
  }
</ul> */


/* 2. Tipos de DirectivasEn Angular existen 3 tipos de 
directivas:TipoDescripciónEjemploComponentesDirectivas
 con plantilla HTML 
 asociadas.@Component({...})AtributoModifican la
  apariencia o comportamiento de un elemento existente.
  [ngClass], [ngStyle], o una directiva personalizada
   appHighlightEstructuralesModifican la estructura del
    DOM agregando o quitando elementos.*ngIf, *ngFor, 
    *ngTemplateOutlet */


/* 3. Pipes (Transformación de Datos)
Un Pipe es una función pura que recibe un dato de entrada en la plantilla HTML y lo transforma visualmente sin alterar el valor original en TypeScript.

A. Pipes Integrados Comunes:
{{ fecha | date:'dd/MM/yyyy' }}

{{ precio | currency:'USD' }}

{{ texto | uppercase }}

{{ objeto | json }} (Súper útil para depuración)

{{ observable$ | async }} (Maneja la suscripción/desuscripción automática) */    



// B. Pipes Personalizados (Custom Pipes):
// Se crean con la anotación @Pipe() e implementan la interfaz PipeTransform:

 
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multiplicar',
  standalone: true
})
export class MultiplicarPipe implements PipeTransform {
  // El método transform recibe el valor base y los parámetros deseados
  transform(val: number, factor: number = 2): number {
    return val * factor;
  }
}
// Uso en el HTML:

// HTML
// <!-- Multiplica 5 por 3 = 15 -->
<p>{{ 5 | multiplicar:3 }}</p>

//signal

@Injectable({ providedIn: 'root' })
export class UserService {
  // Estado privado que solo el servicio puede modificar
  private _user = signal<User | null>(null);

  // Exposición pública de solo lectura
  user = this._user.asReadonly();

  setUser(newUser: User) {
    this._user.set(newUser);
  }
}

// formulario con form data con ReactiveFormsModule
/* 
💻 1. El Componente TypeScript (login.component.ts)
Inyectamos FormBuilder usando inject(), construimos la estructura del formulario y aplicamos validaciones:

TypeScript */
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  // 💡 IMPORTE CLAVE: Debes incluir ReactiveFormsModule en los imports
  imports: [ReactiveFormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);

  // 1. Definición del formulario con sus controles y validadores
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // 2. Método para procesar el envío
  onSubmit(): void {
    if (this.loginForm.valid) {
      // Obtenemos los valores de forma totalmente tipada
      const formData = this.loginForm.value;
      console.log('Datos enviados:', formData);
    } else {
      // Marcar todos los campos como tocados para mostrar errores de validación
      this.loginForm.markAllAsTouched();
    }
  }

  // Getters auxiliares para facilitar la lectura en la plantilla HTML
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
📄 /* 2. La Plantilla HTML (login.component.html)
Enlazamos la estructura usando la directiva [formGroup] en la etiqueta <form> y formControlName en cada <input>. Además, usamos el nuevo Control Flow (@if) de Angular para mostrar los errores:

HTML
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="form-container">
  <h2>Iniciar Sesión</h2>

  <!-- Campo Email -->
  <div class="form-group">
    <label for="email">Correo Electrónico:</label>
    <input 
      id="email" 
      type="email" 
      formControlName="email" 
      placeholder="correo@ejemplo.com"
    />

    <!-- Mensajes de Error con @if -->
    @if (email?.invalid && email?.touched) {
      <div class="error-msg">
        @if (email?.errors?.['required']) { <small>El correo es obligatorio.</small> }
        @if (email?.errors?.['email']) { <small>Ingresa un correo válido.</small> }
      </div>
    }
  </div>

  <!-- Campo Password -->
  <div class="form-group">
    <label for="password">Contraseña:</label>
    <input 
      id="password" 
      type="password" 
      formControlName="password" 
      placeholder="******"
    />

    @if (password?.invalid && password?.touched) {
      <div class="error-msg">
        @if (password?.errors?.['required']) { <small>La contraseña es obligatoria.</small> }
        @if (password?.errors?.['minlength']) { <small>Mínimo 6 caracteres.</small> }
      </div>
    }
  </div>

  <!-- Botón Enviar -->
  <button type="submit" [disabled]="loginForm.invalid">
    Ingresar
  </button>
</form> */

// formulario con ngmodel [(ngModel)]

/* El enfoque con [(ngModel)] pertenece a los Forms Basados en Plantillas (Template-Driven Forms). 
Es un estilo mucho más directo y declarativo donde el estado y las validaciones viven mayoritariamente
en el código HTML. */



/* 💻 1. El Componente TypeScript (login.component.ts)
En el TypeScript solo declaramos un objeto con las propiedades o variables locales. No hay FormGroup ni Validators.
*/

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 💡 IMPORTANTE: Debes importar FormsModule

@Component({
  selector: 'app-login',
  standalone: true,
  // 💡 IMPORTE CLAVE: Se importa FormsModule (NO ReactiveFormsModule)
  imports: [FormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Modelo de datos plano conectado con la plantilla vía Two-Way Binding [(ngModel)]
  user = {
    email: '',
    password: ''
  };

  onSubmit(): void {
    console.log('Datos enviados desde ngModel:', this.user);
  }
}
/* 📄 2. La Plantilla HTML (login.component.html)
Aquí es donde ocurre la magia del enlace en dos vías (Two-Way Data Binding). Usamos la sintaxis de "banana in a box" [(ngModel)] y creamos referencias de plantilla (#emailModel="ngModel") para capturar las validaciones HTML5.

HTML
<!-- Se crea una referencia local (#loginForm="ngForm") al formulario entero -->
<form #loginForm="ngForm" (ngSubmit)="onSubmit()" class="form-container">
  <h2>Iniciar Sesión (Template-Driven)</h2>

  <!-- Campo Email -->
  <div class="form-group">
    <label for="email">Correo Electrónico:</label>
    <input 
      type="email" 
      id="email" 
      name="email" 
      [(ngModel)]="user.email" 
      #emailModel="ngModel"
      required 
      email
      placeholder="correo@ejemplo.com"
    />

    <!-- Validaciones usando el objeto local #emailModel y el nuevo Control Flow (@if) -->
    @if (emailModel.invalid && emailModel.touched) {
      <div class="error-msg">
        @if (emailModel.errors?.['required']) { <small>El correo es obligatorio.</small> }
        @if (emailModel.errors?.['email']) { <small>Ingresa un correo válido.</small> }
      </div>
    }
  </div>

  <!-- Campo Password -->
  <div class="form-group">
    <label for="password">Contraseña:</label>
    <input 
      type="password" 
      id="password" 
      name="password" 
      [(ngModel)]="user.password" 
      #passwordModel="ngModel"
      required 
      minlength="6"
      placeholder="******"
    />

    @if (passwordModel.invalid && passwordModel.touched) {
      <div class="error-msg">
        @if (passwordModel.errors?.['required']) { <small>La contraseña es obligatoria.</small> }
        @if (passwordModel.errors?.['minlength']) { <small>Mínimo 6 caracteres.</small> }
      </div>
    }
  </div>

  <!-- Botón Enviar (se deshabilita si el formulario global no es válido) -->
  <button type="submit" [disabled]="loginForm.invalid">
    Ingresar
  </button>
</form>
 */

// lista de busqueda con to observle y to signal


import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// 💡 LIBRERÍA CLAVE: Conecta Signals con RxJS
import { toObservable, toSignal } from '@angular/core/rxjs-interop'; 
import { debounceTime, switchMap, filter } from 'rxjs';

@Component({
  selector: 'app-user-search',
  standalone: true,
  template: `
    <input 
      type="text" 
      [value]="query()" 
      (input)="onSearch($event)" 
      placeholder="Buscar por nombre..." 
    />

    <!-- Consumimos el Signal final 'usuarios' directamente en la vista -->
    <ul>
      @for (user of usuarios(); track user.id) {
        <li>{{ user.name }}</li>
      }
    </ul>
  `
})
export class UserSearchComponent {
  private http = inject(HttpClient);

  // 1. SIGNAL: Captura el valor actual del input (Estado de la UI)
  query = signal('');

  // 2. RXJS: Convertimos el Signal a Observable para usar la potencia del tiempo y asincronía
  private search$ = toObservable(this.query).pipe(
    debounceTime(300),                                   // Espera 300ms de silencio
    filter(texto => texto.length >= 3),                   // Filtra si hay menos de 3 letras
    switchMap(texto => this.http.get<any[]>(`/api/users?q=${texto}`)) // Cancela búsquedas previas
  );

  // 3. SIGNAL: Convertimos la respuesta de RxJS de vuelta a un Signal para la vista
  // (Cero .subscribe() manual y cero pipe async)
  usuarios = toSignal(this.search$, { initialValue: [] });

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.query.set(input.value); // Actualiza el Signal
  }
}


//Built-in Control Flow
/* La nueva sintaxis de control de flujo (Built-in Control Flow) introducida en Angular 17 reemplaza las directivas estructurales con bloques nativos que mejoran el rendimiento, la legibilidad y no requieren importar CommonModule.

Usando el mismo estado del componente en TypeScript:

HTML
<!-- 1. Bloque @if / @else -->
@if (isLoggedIn) {
  <p>¡Bienvenido de nuevo, usuario!</p>
} @else {
  <p>Por favor, inicia sesión para continuar.</p>
}

<hr>

<!-- 2. Bloque @for (requiere definir la propiedad 'track') -->
<h3>Lista de Productos</h3>
<ul>
  @for (producto of productos; track producto.id; let i = $index) {
    <li>{{ i + 1 }}. {{ producto.nombre }} - <strong>{{ producto.estado }}</strong></li>
  } @empty {
    <li>No hay productos disponibles.</li>
  }
</ul>

<hr>

<!-- 3. Bloque @switch -->
<h3>Modo de Visualización</h3>

@switch (vistaActual) {
  @case ('lista') {
    <p>Viendo los productos en modo **Lista**.</p>
  }
  @case ('mosaico') {
    <p>Viendo los productos en modo **Mosaico**.</p>
  }
  @case ('detalles') {
    <p>Viendo los productos en modo **Detalles**.</p>
  }
  @default {
    <p>Vista no reconocida.</p>
  }
} */

//binding clases & styles

/* 
El property binding de clases ([class...]) y estilos ([style...]) es la forma nativa e ideal en Angular para modificar la apariencia de un elemento sin depender de ngClass o ngStyle. Permite usar expresiones condicionales como operadores ternarios (? :) o evaluadores booleanos directos.

Componente en TypeScript (app.component.ts)

TypeScript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Estados para condiciones
  isOnline: boolean = true;
  userRole: string = 'admin'; // 'admin', 'user' o 'guest'
  batteryLevel: number = 15; // Porcentaje
}
Plantilla en HTML (app.component.html)

HTML
<!-- 1. Property Binding para CLASES [class...] -->

<!-- Evalúa un booleano: activa la clase 'status-online' si isOnline es true -->
<span [class.status-online]="isOnline">
  Estado del usuario
</span>

<!-- Operador ternario: asigna la clase 'text-success' o 'text-danger' según la condición -->
<p [class]="isOnline ? 'text-success' : 'text-danger'">
  {{ isOnline ? 'Conectado' : 'Desconectado' }}
</p>

<!-- Múltiples condiciones: aplica distintas clases según el valor de userRole -->
<div [class]="userRole === 'admin' ? 'badge-admin' : userRole === 'user' ? 'badge-user' : 'badge-guest'">
  Rol: {{ userRole }}
</div>

<hr>

<!-- 2. Property Binding para ESTILOS [style...] -->

<!-- Evalúa una condición booleana para definir el valor CSS -->
<button [style.background-color]="isOnline ? '#198754' : '#dc3545'">
  Acción
</button>

<!-- Especifica la unidad directamente (.px, .rem, .%) y calcula valores dinámicos -->
<div 
  [style.width.%]="batteryLevel" 
  [style.color]="batteryLevel < 20 ? 'red' : 'green'">
  Batería: {{ batteryLevel }}%
</div>

<!-- Aplica estilos sólo si la condición es verdadera (si es false, remueve la propiedad) -->
<h2 [style.text-decoration]="isOnline ? 'underline' : 'none'">
  Título dinámico
</h2> */

///authguard

/* En Angular, un CanActivateFn (Functional Route Guard) es la forma estándar de proteger rutas.

A continuación tienes un ejemplo completo que bloquea el acceso a una ruta y redirige al usuario a /login si no está autenticado.

1. El Servicio de Autenticación (auth.service.ts)

TypeScript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  // Métodos para cambiar estado (ejemplo)
  login() { this.loggedIn = true; }
  logout() { this.loggedIn = false; }
}
2. El AuthGuard Funcional (auth.guard.ts)

TypeScript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Permite el acceso a la ruta
  }

  // Redirige al login si no está autenticado
  return router.createUrlTree(['/login']);
};
3. Configuración de Rutas (app.routes.ts)

Aplica el guard dentro de la propiedad canActivate de la ruta protegida:

TypeScript
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard] // Ruta protegida
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
]; */

/* 
///interceptor para jwt

El interceptor HTTP funcional (HttpInterceptorFn) te permite modificar las peticiones de salida de forma global. Dado que los objetos HttpRequest son inmutables en Angular, el interceptor clona la petición para agregar el encabezado Authorization.

1. El Interceptor Funcional (auth.interceptor.ts)

TypeScript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Obtiene el token desde el servicio (o directamente desde localStorage)
  const token = authService.getToken(); // ej: localStorage.getItem('token')

  // Si existe el token, clona la petición y añade el encabezado
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq); // Envía la petición modificada
  }

  // Si no hay token, continúa con la petición original sin cambios
  return next(req);
};
2. Configuración Global (app.config.ts)

Para que el interceptor funcione, debes registrarlo usando withInterceptors al configurar el cliente HTTP de la aplicación:

TypeScript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor]) // Registra el interceptor aquí
    )
  ]
}; */


// routes necesesario
// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router'; // 💡 Las directivas de UI

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, // Necesario para la etiqueta <router-outlet></router-outlet>
    RouterLink    // Necesario para las directivas [routerLink]="['/path']"
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {}

/* 

1. Componente que abre el Modal (parent.component.ts)
El componente padre utiliza el servicio MatDialog para abrir el modal, enviarle datos de entrada mediante la propiedad data, y suscribirse o procesar la respuesta al cerrarse mediante un Observable o Promise.

TypeScript */
import { Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserEditModalComponent } from './user-edit-modal.component';

export interface UserData {
  id: number;
  name: string;
}

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <h2>Usuario: {{ user().name }}</h2>
    <button (click)="openEditModal()">Editar Usuario</button>
  `
})
export class ParentComponent {
  private dialog = inject(MatDialog);
  
  // Estado local usando Signal
  user = signal<UserData>({ id: 1, name: 'Juan Bernal' });

  openEditModal(): void {
    // 1. Abre el modal, pasa datos y define configuración
    const dialogRef = this.dialog.open(UserEditModalComponent, {
      width: '400px',
      data: { id: this.user().id, name: this.user().name } // Data de entrada
    });

    // 2. Escucha la respuesta enviada al cerrar
    dialogRef.afterClosed().subscribe((updatedName: string | undefined) => {
      if (updatedName) {
        this.user.update(u => ({ ...u, name: updatedName }));
      }
    });
  }
}
/* 2. Componente dentro del Modal (user-edit-modal.component.ts)
El modal consume los datos de entrada usando el Token de inyección MAT_DIALOG_DATA y controla el cierre devolviendo información mediante MatDialogRef.

TypeScript */
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { 
  MAT_DIALOG_DATA, 
  MatDialogRef, 
  MatDialogModule 
} from '@angular/material/dialog';
import { UserData } from './parent.component';

@Component({
  selector: 'app-user-edit-modal',
  standalone: true,
  imports: [MatDialogModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Editar Usuario</h2>
    
    <mat-dialog-content>
      <label>Nombre:</label>
      <input [(ngModel)]="currentName" />
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <!-- Cierra devolviendo undefined (Cancelar) -->
      <button (click)="cancel()">Cancelar</button>
      
      <!-- Cierra enviando los nuevos datos (Guardar) -->
      <button (click)="save()" color="primary">Guardar</button>
    </mat-dialog-actions>
  `
})
export class UserEditModalComponent {
  // Inyección del controlador del modal para cerrarlo
  private dialogRef = inject(MatDialogRef<UserEditModalComponent>);
  
  // Inyección de los datos pasados desde el padre
  public data = inject<UserData>(MAT_DIALOG_DATA);

  // Estado local prellenado con los datos recibidos
  currentName = this.data.name;

  save(): void {
    // Retorna el dato al componente padre al cerrar
    this.dialogRef.close(this.currentName);
  }

  cancel(): void {
    this.dialogRef.close(); // Cierra sin retornar datos
  }
}

/* A continuación te presento una implementación completa de un servicio de Angular (UserService) para consumir una API REST realizando operaciones CRUD (GET, POST, PUT/PATCH y DELETE).

Incluye el uso de HttpClient, Signals, tipos estrictos con Interfaces y manejo de errores básico.

1. La Interfaz del Modelo (user.model.ts)
TypeScript */
export interface User {
  id: number;
  name: string;
  email: string;
}

// Omitimos el 'id' para la creación, ya que el servidor lo genera
export type CreateUserDto = Omit<User, 'id'>;

// Hacemos los campos opcionales para actualizaciones parciales
export type UpdateUserDto = Partial<CreateUserDto>;
// 2. El Servicio HTTP (user.service.ts)
// TypeScript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://api.example.com/api/users';

  // 1. GET: Obtener todos los usuarios
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
, 
  // 2. GET BY ID: Obtener un solo usuario por su ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // 3. POST: Crear un nuevo usuario
  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // 4. PUT: Actualizar un usuario completo
  updateUser(id: number, user: CreateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  // 5. PATCH: Actualizar parcialmente un usuario (campos específicos)
  patchUser(id: number, changes: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, changes);
  }

  // 6. DELETE: Eliminar un usuario
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
// 3. Ejemplo de Consumo en un Componente (user-manager.component.ts)
// Así es como utilizas cada método del servicio dentro de un componente Standalone combinándolo con Signals:

// TypeScript
import { Component, inject, signal, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { User, CreateUserDto } from './user.model';

@Component({
  selector: 'app-user-manager',
  standalone: true,
  template: `
    <h2>Gestión de Usuarios</h2>
    
    <button (click)="addUser()">Crear Usuario</button>

    <ul>
      @for (user of users(); track user.id) {
        <li>
          {{ user.name }} ({{ user.email }})
          <button (click)="editUser(user.id)">Editar</button>
          <button (click)="removeUser(user.id)">Eliminar</button>
        </li>
      }
    </ul>
  `
})
export class UserManagerComponent implements OnInit {
  private userService = inject(UserService);

  // Estado reactivo con Signal
  users = signal<User[]>([]);

  ngOnInit(): void {
    this.loadUsers();
  }

  // Lectura (GET)
  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => this.users.set(data),
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  // Creación (POST)
  addUser(): void {
    const newUser: CreateUserDto = {
      name: 'Sebastian Bernal',
      email: 'juan@example.com'
    };

    this.userService.createUser(newUser).subscribe({
      next: (createdUser) => {
        // Actualizamos el Signal inmutablemente añadiendo el nuevo registro
        this.users.update(current => [...current, createdUser]);
      }
    });
  }

  // Edición (PUT/PATCH)
  editUser(id: number): void {
    this.userService.patchUser(id, { name: 'Sebastian Actualizado' }).subscribe({
      next: (updatedUser) => {
        this.users.update(current => 
          current.map(u => u.id === id ? updatedUser : u)
        );
      }
    });
  }

  // Borrado (DELETE)
  removeUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users.update(current => current.filter(u => u.id !== id));
      }
    });
  }
}
🔑/*  Aspectos Clave a Destacar en la Entrevista
Inyección con inject(HttpClient): Se prefiere la función inject() sobre la inyección tradicional por constructor.

Tipado estricto de respuesta: Métodos como http.get<User[]>() le dicen a TypeScript exactamente qué tipo de dato devolverá la petición.

PUT vs PATCH: PUT reemplaza el objeto completo en el servidor; PATCH solo envía los campos que sufrieron cambios (UpdateUserDto).

Actualizaciones inmutables en Signals: Al hacer un POST, PATCH o DELETE, se usa .update() modificando el array sin mutar la referencia original. */

git switch -c feature/login-jwt
git add .
git commit -m "feat: termino la funcionalidad X"
git push origin mi-rama-feature

# 1. Estando en tu rama feature, actualizas main remoto
git fetch origin

# 2. Traes los últimos cambios de main a TU rama de feature
git merge origin/main   # (o git rebase origin/main)

# 3. Pruebas que todo funcione y resuelves conflictos aquí

# 4. Ahora sí, vas a main y haces el merge limpio
git checkout main
git merge mi-rama-feature
git push origin main
