import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = "https://stasakmcnscgdqphhsou.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YXNha21jbnNjZ2RxcGhoc291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NjI4NzUsImV4cCI6MjA1OTAzODg3NX0.slsteyy0PHxuMzc0k0OL6EZmca-twQKymNs0rp000Vo";
const supabase = createClient(supabaseUrl, supabaseKey);

// Obtener o crear ID de equipo en localStorage
const getEquipoId = () => {
    let equipoId = localStorage.getItem('equipoId');
    if (!equipoId) {
        equipoId = 'eq-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('equipoId', equipoId);
    }
    return equipoId;
};

// CARRUSEL AUTOMÁTICO (cambia cada 4 segundos)
const carrusel = document.querySelector('.carrusel-inner');
const images = document.querySelectorAll('.carrusel-img');
let currentIndex = 0;
const imageWidth = 100; // Porcentaje

function updateCarousel() {
    carrusel.style.transform = `translateX(-${currentIndex * imageWidth}%)`;
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel();
}

// Iniciar intervalo para cambio automático
let carruselInterval = setInterval(nextSlide, 4000);

// Pausar el carrusel cuando el mouse está sobre él
document.querySelector('.carrusel').addEventListener('mouseenter', () => {
    clearInterval(carruselInterval);
});

// Reanudar el carrusel cuando el mouse sale
document.querySelector('.carrusel').addEventListener('mouseleave', () => {
    carruselInterval = setInterval(nextSlide, 4000);
});

// Inicializar carrusel
updateCarousel();

// SISTEMA DE ESTRELLAS CON MEDIAS PUNTUACIONES
const starsInput = document.getElementById('starsInput');
const starsForeground = document.getElementById('starsForeground');
const ratingValue = document.getElementById('ratingValue');

starsInput.addEventListener('input', (e) => {
    const value = e.target.value;
    const percentage = (value / 10) * 100;
    starsForeground.style.width = `${percentage}%`;
    ratingValue.value = value / 2; // Convertir a escala de 0-5
});

// Sistema de comentarios
const equipoId = getEquipoId();
const comentarioForm = document.getElementById('comentarioForm');
const comentariosList = document.getElementById('comentariosList');
const comentarioLimit = document.getElementById('comentarioLimit');

// Cargar comentarios existentes
async function cargarComentarios() {
    const { data, error } = await supabase
        .from('lookbook_comentarios')
        .select('*')
        .order('fecha', { ascending: false });
    
    if (error) {
        console.error('Error cargando comentarios:', error);
        return;
    }

    comentariosList.innerHTML = data.map(comentario => `
        <div class="comentario-card">
            <div class="comentario-header">
                <span class="comentario-usuario">${comentario.usuario_nombre}</span>
                <span>${new Date(comentario.fecha).toLocaleDateString()}</span>
            </div>
            <div class="comentario-rating">
                ${renderRatingStars(comentario.calificacion)}
            </div>
            <p class="comentario-texto">${comentario.comentario}</p>
        </div>
    `).join('');
}

// Función para mostrar estrellas con medias puntuaciones
function renderRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    stars += '★'.repeat(fullStars);
    stars += hasHalfStar ? '½' : '';
    stars += '☆'.repeat(emptyStars);
    
    return stars;
}

// Verificar límite de comentarios
async function verificarLimiteComentarios() {
    const { count, error } = await supabase
        .from('lookbook_comentarios')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('equipo_id', equipoId);
    
    if (error) {
        console.error('Error verificando límite:', error);
        return;
    }

    const comentariosRestantes = 3 - (count || 0);
    comentarioLimit.textContent = `Te quedan ${comentariosRestantes} comentarios para este equipo`;
    
    if (comentariosRestantes <= 0) {
        comentarioForm.querySelector('button').disabled = true;
        comentarioLimit.textContent = 'Has alcanzado el límite de 3 comentarios por equipo';
    }
}

// Enviar nuevo comentario
comentarioForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const comentario = document.getElementById('comentario').value;
    const rating = document.getElementById('ratingValue').value;
    
    if (rating == 0) {
        alert('Por favor selecciona una calificación');
        return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    const { error } = await supabase
        .from('lookbook_comentarios')
        .insert([{
            usuario_id: user?.id || null,
            usuario_nombre: usuario,
            comentario: comentario,
            calificacion: rating,
            equipo_id: equipoId
        }]);
    
    if (error) {
        alert('Error al enviar comentario: ' + error.message);
        return;
    }
    
    // Limpiar formulario y recargar comentarios
    comentarioForm.reset();
    starsForeground.style.width = '0%';
    ratingValue.value = '0';
    cargarComentarios();
    verificarLimiteComentarios();
});

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    cargarComentarios();
    verificarLimiteComentarios();
    
    // Si el usuario está autenticado, cargar su nombre
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        document.getElementById('usuario').value = user.email.split('@')[0];
    }
});