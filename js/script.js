// Usamos la función 'createClient' de la librería cargada
const supabaseUrl = "https://stasakmcnscgdqphhsou.supabase.co";  // URL de tu proyecto
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YXNha21jbnNjZ2RxcGhoc291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NjI4NzUsImV4cCI6MjA1OTAzODg3NX0.slsteyy0PHxuMzc0k0OL6EZmca-twQKymNs0rp000Vo";  // API Key de tu proyecto
const supabase = supabase.createClient(supabaseUrl, supabaseKey);  // Usamos la función de 'supabase' que está disponible globalmente

async function obtenerProductos() {
    let { data, error } = await supabase.from('productos').select('*');
    if (error) {
        console.error("Error al obtener productos:", error);
    } else {
        console.log("Productos obtenidos:", data); // Verifica si los datos son correctos
        if (data.length === 0) {
            console.log("No se encontraron productos en la base de datos.");
        }
        mostrarProductos(data); // Muestra los productos en la página
    }
}

function mostrarProductos(productos) {
    const contenedor = document.getElementById("productos-container");
    contenedor.innerHTML = ""; // Limpia el contenedor antes de agregar nuevos productos
    productos.forEach(producto => {
        let div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <img src="${producto.image}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio}</p>
        `;
        contenedor.appendChild(div);
    });
}

// Asignar el evento al botón de cargar productos
const botonCargar = document.getElementById("cargar-productos");
botonCargar.addEventListener("click", obtenerProductos);
