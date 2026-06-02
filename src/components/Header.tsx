import { useState } from 'react';
import { ChevronDown, Instagram, MapPin, Menu, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';

const WHATSAPP_SVG = (size: number) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z"/>
  </svg>
);

const dropdownStyle = {
  zIndex: 9999,
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  marginTop: '-2px',
  paddingTop: '6px',
  paddingBottom: '6px',
};

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projetosOpen, setProjetosOpen] = useState(false);
  const [modelosOpen, setModelosOpen] = useState(false);
  const [, navigate] = useHashLocation();

  const navBtn = "text-xs md:text-sm lg:text-base font-semibold transition-all duration-300 pb-2 text-gray-600 hover:text-blue-600 border-b-3 border-transparent whitespace-nowrap flex-shrink-0";

  const projetoLinks = [
    ['AACC', '/projetos/aacc'],
    ['AIEX', '/projetos/aiex'],
    ['CIFOP', '/projetos/cifop'],
    ['Seminários', '/projetos/seminarios'],
    ['PIBID', '/projetos/pibid'],
    ['Eventos', '/projetos/eventos'],
    ['Materiais Gratuitos', '/projetos/materiais'],
  ];

  const secretariaLinks = [
    ['Solicitações', '/secretaria/solicitacoes'],
    ['Contatos', '/secretaria/contatos'],
  ];

  return (
    <header className="bg-white shadow-md sticky top-0" style={{ zIndex: 100, overflow: 'visible' }}>
      <div className="py-4 px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="max-w-7xl mx-auto">

          {/* Desktop */}
          <div className="hidden md:flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030187894/57Ypr7wbFX6eHCZZ7V6o8w/logo_cc3239cb.png"
                alt="Unimontes Logo"
                className="h-12 md:h-14 w-auto"
              />
            </div>

            {/* Navegação */}
            <div className="flex items-center gap-2 md:gap-4 lg:gap-6 flex-1 justify-center flex-nowrap min-w-0 overflow-visible">
              <button onClick={() => navigate('/')} className={navBtn}>Agenda Semanal</button>
              <button onClick={() => navigate('/')} className={navBtn}>Notícias</button>
              <button onClick={() => window.open('https://drive.google.com/file/d/1KtIHqC2_AzpwGb-lZFTKTyxNVGr_MIcV/view', '_blank')} className={navBtn}>Calendário Escolar</button>
              <button onClick={() => window.open('https://unimontes.br/editais/', '_blank')} className={navBtn}>Editais</button>
              <button onClick={() => window.open('https://www.coteps.unimontes.br/vestibular/', '_blank')} className={navBtn}>Vestibular</button>
              <button onClick={() => window.open('https://www.webgiz.unimontes.br/', '_blank')} className={navBtn}>Webgiz</button>

              {/* Projetos dropdown */}
              <div className="relative flex-shrink-0" onMouseEnter={() => setProjetosOpen(true)} onMouseLeave={() => setProjetosOpen(false)}>
                <button className={`${navBtn} flex items-center gap-1`}>
                  Projetos <ChevronDown size={14} />
                </button>
                {projetosOpen && (
                  <div className="absolute top-full left-0 bg-white rounded-lg min-w-[160px]" style={dropdownStyle}>
                    {projetoLinks.map(([label, path]) => (
                      <button key={path} onClick={() => { navigate(path); setProjetosOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-blue-600">{label}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Secretaria dropdown */}
              <div className="relative flex-shrink-0" onMouseEnter={() => setModelosOpen(true)} onMouseLeave={() => setModelosOpen(false)}>
                <button className={`${navBtn} flex items-center gap-1`}>
                  Secretaria <ChevronDown size={14} />
                </button>
                {modelosOpen && (
                  <div className="absolute top-full left-0 bg-white rounded-lg min-w-[160px]" style={dropdownStyle}>
                    {secretariaLinks.map(([label, path]) => (
                      <button key={path} onClick={() => { navigate(path); setModelosOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-blue-600">{label}</button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => navigate('/sobre')} className={navBtn}>Sobre</button>
            </div>

            {/* Fale conosco */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Fale conosco</span>
              <div className="flex items-center gap-3">
                <a href="https://www.instagram.com/unimontes.almenara" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600 transition-colors" aria-label="Instagram"><Instagram size={24} /></a>
                <a href="https://wa.me/5538991840146?text=Olá%20Unimontes%20Campus%20Almenara" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors" aria-label="WhatsApp">{WHATSAPP_SVG(24)}</a>
                <a href="https://www.google.com/maps/place/Universidade+Estadual+de+Montes+Claros-Campus+Almenara/@-16.1728886,-40.6997711,19.5z" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors" aria-label="Localização"><MapPin size={24} /></a>
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center justify-center relative">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 hover:text-blue-600 transition-colors absolute left-0" aria-label="Menu">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex justify-center cursor-pointer" onClick={() => navigate('/')}>
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030187894/57Ypr7wbFX6eHCZZ7V6o8w/logo_cc3239cb.png" alt="Unimontes Logo" className="h-10 w-auto" />
            </div>
            <div className="flex flex-col items-center gap-1 absolute right-0">
              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Fale conosco</span>
              <div className="flex items-center gap-2">
                <a href="https://www.instagram.com/unimontes.almenara" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600 transition-colors" aria-label="Instagram"><Instagram size={18} /></a>
                <a href="https://wa.me/5538991840146?text=Olá%20Unimontes%20Campus%20Almenara" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors" aria-label="WhatsApp">{WHATSAPP_SVG(18)}</a>
                <a href="https://www.google.com/maps/place/Universidade+Estadual+de+Montes+Claros-Campus+Almenara/@-16.1728886,-40.6997711,19.5z" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors" aria-label="Localização"><MapPin size={18} /></a>
              </div>
            </div>
          </div>

          {/* Mobile menu expandido */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-2 border-t border-gray-100 space-y-1">
              <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100">Agenda Semanal</button>
              <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100">Notícias</button>
              <button onClick={() => window.open('https://drive.google.com/file/d/1KtIHqC2_AzpwGb-lZFTKTyxNVGr_MIcV/view', '_blank')} className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100">Calendário Escolar</button>
              <button onClick={() => window.open('https://unimontes.br/editais/', '_blank')} className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100">Editais</button>
              <button onClick={() => window.open('https://www.coteps.unimontes.br/vestibular/', '_blank')} className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100">Vestibular</button>
              <button onClick={() => window.open('https://www.webgiz.unimontes.br/', '_blank')} className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100">Webgiz</button>

              {/* Projetos mobile */}
              <div>
                <button onClick={() => { const el = document.getElementById('projetos-mobile-menu'); if (el) el.classList.toggle('hidden'); }} className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 flex items-center justify-between">
                  Projetos <ChevronDown size={16} />
                </button>
                <div id="projetos-mobile-menu" className="hidden pl-4 space-y-1">
                  {projetoLinks.map(([label, path]) => (
                    <button key={path} onClick={() => { navigate(path); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">{label}</button>
                  ))}
                </div>
              </div>

              {/* Secretaria mobile */}
              <div>
                <button onClick={() => { const el = document.getElementById('modelos-mobile-menu'); if (el) el.classList.toggle('hidden'); }} className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 flex items-center justify-between">
                  Secretaria <ChevronDown size={16} />
                </button>
                <div id="modelos-mobile-menu" className="hidden pl-4 space-y-1">
                  {secretariaLinks.map(([label, path]) => (
                    <button key={path} onClick={() => { navigate(path); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">{label}</button>
                  ))}
                </div>
              </div>

              <button onClick={() => { navigate('/sobre'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100">Sobre</button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
