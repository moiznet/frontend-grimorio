//3. Renderizado Condicional
//A. Operador Lógico AND (&&)

function Notificaciones({ mensajes }) {
  return (
    <div>
      <h2>Bandeja de entrada</h2>
      {mensajes.length > 0 && (
        <p>Tienes {mensajes.length} mensajes sin leer.</p>
      )}
    </div>
  );
}

//B. Operador Ternario (condicion ? true : false)

function BotonEstado({ estaLogueado }) {
  return (
    <div>
      {estaLogueado ? (
        <button onClick={cerrarSesion}>Cerrar Sesión</button>
      ) : (
        <button onClick={iniciarSesion}>Iniciar Sesión</button>
      )}
    </div>
  );
}


//C. Retorno Temprano (Early Return con if)

function PerfilUsuario({ usuario, cargando, error }) {
  if (cargando) return <Spinner />;
  if (error) return <MensajeError error={error} />;
  if (!usuario) return null; // Devuelve null para no renderizar nada

  return (
    <div>
      <h1>{usuario.nombre}</h1>
      <p>{usuario.email}</p>
    </div>
  );
}

//D. renderizado condicional con switch

function EstadoPedido({ estado }) { 
  switch (estado) {
    case 'pendiente':
      return <p>El pedido está pendiente de procesamiento.</p>;
    case 'en-proceso':
      return <p>El pedido está en proceso de envío.</p>;
    case 'entregado':
      return <p>El pedido ha sido entregado.</p>;
    default:
      return <p>Estado del pedido no reconocido.</p>;
  }
}

//E. renderizado condicional con if-else

function MensajeBienvenida({ usuario }) {  
  if (!usuario) {
    return <p>Bienvenido, invitado!</p>;
  }
  return <p>Bienvenido, {usuario.nombre}!</p>;
}

/* 1. Contexto Histórico: Clases vs. Funcionales
Históricamente (antes de 2019 con React 16.8), la elección de la sintaxis dependía totalmente de si el componente necesitaba manejar estado o ciclo de vida:

Componentes de Clases (Class Components): Eran los únicos capaces de manejar estado local (this.state) y utilizar los métodos del ciclo de vida (componentDidMount, componentDidUpdate, componentWillUnmount). Se los conocía como componentes "inteligentes" (Stateful).

Componentes Funcionales (Functional Components): Eran funciones simples de JavaScript que solo recibían props y devolvían JSX. No podían tener estado ni efectos secundarios. Se les llamaba componentes "tontos" o de presentación (Stateless / Dummy).
 */

// Sintaxis Clase ES6 que extiende React.Component	Función simple de JS / Arrow Function

// Estado Local Objeto this.state y this.setState()	Hook useState

// Ciclo de Vida componentDidMount / DidUpdate / Unmount.	Hook useEffect

// Acceso al DOM / Refs  React.createRef() / this.myRef	Hook useRef


// 2. COMPONENTE FUNCIONAL (Migrado)
import { useState, useEffect, useMemo } from 'react';

function UsuarioFuncional({ id, nombre }) {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    // Código de montaje / actualización
    api.subscribir();
    api.actualizar(id);

    // Función de limpieza (Cleanup function = componentWillUnmount)
    return () => {
      api.desubscribir();
    };
  }, [id]); // Array de dependencias = controla cuándo se ejecuta (componentDidUpdate)

  return <div>{nombre}</div>;
}


// Cambios	Provienen del padre; si las props cambian, el componente se re-renderiza.	El propio componente decide cuándo y cómo actualizar su estado.

//Correcto (Creando nuevas referencias con Operador Spread ...):
// Arrays: Usando Spread o métodos inmutables (map, filter, concat)
const [lista, setLista] = useState(['Manzana', 'Pera']);
setLista([...lista, 'Uva']); // ✅ Se crea un nuevo Array en memoria

// Objetos: Copiando propiedades anteriores y sobrescribiendo
const [usuario, setUsuario] = useState({ nombre: 'Ana', edad: 25 });
setUsuario({
  ...usuario, // Copia todas las propiedades
  edad: 26    // Actualiza solo edad
}); // ✅ Se crea un nuevo Objeto en memoria


// 3. Flujo de Datos Unidireccional (Unidirectional Data Flow)
// En React, los datos siempre fluyen en una sola dirección: de arriba hacia abajo (desde los componentes padres hacia los componentes hijos).


// Estado Derivado (Derived State) En React existe un principio clave de diseño: Nunca guardes en el estado valores que puedan calcularse directamente a partir de otro estado o de las props.


const incrementarTresVeces = () => {
  setCount(prevCount => prevCount + 1); // prev = 0 -> retorna 1
  setCount(prevCount => prevCount + 1); // prev = 1 -> retorna 2
  setCount(prevCount => prevCount + 1); // prev = 2 -> retorna 3
};
// Resultado final en pantalla: 3 ✅

/* B. Función de Limpieza (Cleanup Function)
Si tu efecto retorna una función, React la ejecutará en dos momentos:

Antes de que el componente se desmonte (destruya).

Antes de volver a ejecutar el efecto (cuando una dependencia haya cambiado).

Es esencial para evitar fugas de memoria (memory leaks) al manejar suscripciones, setInterval, addEventListener o solicitudes red no finalizadas. */


import { useRef } from 'react';

function FormularioLogin() {
  // 1. Declarar la referencia inicializada en null
  const inputEmailRef = useRef(null);

  const enfocarEmail = () => {
    // 3. Acceder al nodo nativo del DOM y llamar sus métodos HTML nativos
    inputEmailRef.current.focus();
  };

  return (
    <div>
      {/* 2. Vincular la referencia mediante la prop `ref` */}
      <input ref={inputEmailRef} type="email" placeholder="correo@ejemplo.com" />
      
      <button onClick={enfocarEmail}>
        Enfocar campo de Email
      </button>
    </div>
  );
}


import { useState, useRef } from 'react';

function Cronometro() {
  const [segundos, setSegundos] = useState(0);
  
  // Guardamos el ID del timer en una ref porque no necesitamos re-renderizar
  // la pantalla cuando guardamos o borramos este ID.
  const timerIdRef = useRef(null);

  const iniciar = () => {
    if (timerIdRef.current !== null) return; // Ya hay un timer corriendo

    timerIdRef.current = setInterval(() => {
      setSegundos((prev) => prev + 1);
    }, 1000);
  };

  const deteneer = () => {
    clearInterval(timerIdRef.current);
    timerIdRef.current = null; // Limpiamos la referencia
  };

  return (
    <div>
      <h1>Tiempo: {segundos}s</h1>
      <button onClick={iniciar}>Iniciar</button>
      <button onClick={deteneer}>Detener</button>
    </div>
  );
}

//Optimización y Rendimiento: useMemo y useCallback (cuándo usarlos y evitar su sobreuso).

import { useState, useMemo } from 'react';

function ListaUsuarios({ usuarios, busqueda }) {
  // Solo se re-ejecuta el filtro si 'usuarios' o 'busqueda' cambian.
  // Evita re-filtrar en renderizados provocados por otros estados del componente.
  const usuariosFiltrados = useMemo(() => {
    console.log('Filtrando usuarios...'); // Operación costosa
    return usuarios.filter(user => 
      user.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [usuarios, busqueda]);

  return (
    <ul>
      {usuariosFiltrados.map(user => (
        <li key={user.id}>{user.nombre}</li>
      ))}
    </ul>
  );
}
const usuariosListados = useMemo(()=>{
  return usuarios.map((usuario) => usuario.nombre);
},[usuarios]);


// usecalback

import { useState, useCallback, memo } from 'react';

// Hijo optimizado con memo: solo re-renderiza si sus props cambian de referencia
const BotonIncrementar = memo(({ alHacerClic }) => {
  console.log('Renderizando Botón Hijo');
  return <button onClick={alHacerClic}>Incrementar</button>;
});

function ContadorPadre() {
  const [count, setCount] = useState(0);
  const [texto, setTexto] = useState('');

  // Sin useCallback, cada cambio en 'texto' crearía una nueva referencia de esta función
  // y provocaría el re-render del BotonIncrementar aunque sus props no cambien conceptualmente.
  const incrementar = useCallback(() => {
    setCount(prev => prev + 1);
  }, []); // Sin dependencias -> la referencia de la función nunca cambia

  return (
    <div>
      <input value={texto} onChange={(e) => setTexto(e.target.value)} />
      <BotonIncrementar alHacerClic={incrementar} />
      <p>Conteo: {count}</p>
    </div>
  );
}

// useMemo(() => fn(), [deps])   ===> Memoriza el VALOR devuelto por fn()
// useCallback(fn, [deps])       ===> Memoriza la FUNCIÓN misma fn


