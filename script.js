// URL oficial do Google Apps Script fornecida por você
const GOOGLE_API_URL = 'https://script.google.com/macros/s/AKfycbyFAh93GimIfoILhAQ13extXKigqZoh3FGPsVChDNLeXuu9j6jbysrd9ld42RWtlSsrOQ/exec';

// ID Temporário do Álbum de Pagode no Spotify (Altere aqui quando os guris mandarem o deles!)
const SPOTIFY_ALBUM_ID = "4vn76aBaaU08z3uCHraE44?si=zZnBjc6AQ96vDF4EbWvESA";

async function carregarEventos() {
    const container = document.getElementById('agenda-lista');
    
    try {
        // Faz a requisição forçando o modo CORS para evitar bloqueios do navegador
        const response = await fetch(GOOGLE_API_URL, { 
            method: 'GET', 
            mode: 'cors' 
        });
        
        if (!response.ok) throw new Error('Não foi possível obter resposta da API da agenda.');
        
        // Lemos a resposta como texto primeiro (essencial para burlar a validação estrita de redirecionamento do Google)
        const textoBruto = await response.text();
        
        // Conversão manual do texto bruto recebido para um Objeto/Array JSON estruturado
        const shows = JSON.parse(textoBruto);
        
        // Validação caso o Google Script tenha retornado alguma mensagem de erro interna
        if (shows.erro) {
            console.error('Erro interno no script do Google:', shows.erro);
            throw new Error(shows.erro);
        }

        // Limpa o texto de "Carregando..." do HTML
        container.innerHTML = '';

        // Se a agenda não tiver nenhum show futuro cadastrado nos próximos 90 dias
        if (!shows || shows.length === 0) {
            container.innerHTML = `<div class="agenda-vazia">Nenhum show agendado para os próximos dias. Preparem o cavaco que logo voltamos!</div>`;
            return;
        }

        // Percorre o array de shows e monta o HTML de cada um deles
        shows.forEach(show => {
            const dataShow = new Date(show.data);
            
            // Formatadores nativos em português (pt-BR)
            const dia = dataShow.toLocaleDateString('pt-BR', { day: '2-digit' });
            const mes = dataShow.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
            const hora = dataShow.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            // Limpa o endereço para exibir apenas o nome do estabelecimento/local (evita quebrar o layout)
            const nomeLocalLimpo = show.local.split(',')[0];
            
            // ANTIBLOQUEIO GOOGLE MAPS: Montagem segura para a IA não quebrar o link do mapa
            const m1 = "www";
            const m2 = "google";
            const m3 = "com";
            const urlSeguraMaps = `https://${m1}.${m2}.${m3}/maps?q=${encodeURIComponent(show.local)}`;

            const linkMapa = show.local !== 'Local a definir' 
                ? urlSeguraMaps 
                : '#';

            // Template estrutural do card do show
            const eventoHTML = `
                <div class="evento-row">
                    <div class="evento-data">
                        <span class="evento-dia">${dia}</span>
                        <span class="evento-mes">${mes}</span>
                    </div>
                    <div class="evento-info">
                        <h3 class="evento-titulo">${show.titulo}</h3>
                        <div class="evento-local-hora">
                            <span>📍 ${nomeLocalLimpo}</span> 
                            <span>🕒 ${hora}</span>
                        </div>
                    </div>
                    <div class="evento-action">
                        <a href="${linkMapa}" target="_blank" class="btn-evento">${show.local !== 'Local a definir' ? 'Como Chegar' : 'Mais Info'}</a>
                    </div>
                </div>
            `;
            
            // Injeta o card dentro do container da página
            container.innerHTML += eventoHTML;
        });

    } catch (error) {
        console.error('Erro crítico no carregamento da agenda:', error);
        container.innerHTML = `<div class="agenda-vazia" style="color: #ff6b6b;">Não foi possível sincronizar a agenda automaticamente neste momento.</div>`;
    }
}

// Inicializador principal executado quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Executa a carga da agenda do Google Sheets
    carregarEventos();

    // INJETOR DINÂMICO ANTIBLOQUEIO DO SPOTIFY
    // Monta a URL oficial com HTTPS juntando partes de texto para evitar adulterações da IA
    const p1 = "open";
    const p2 = "spotify";
    const p3 = "com";
    const urlSeguraSpotify = `https://${p1}.${p2}.${p3}/embed/album/${SPOTIFY_ALBUM_ID}?theme=0`;

    const spotifyIframe = document.getElementById('spotify-album-player');
    if (spotifyIframe) {
        spotifyIframe.src = urlSeguraSpotify;
    }
});
