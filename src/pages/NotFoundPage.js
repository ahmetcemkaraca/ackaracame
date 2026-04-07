import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-white font-noto min-h-screen flex flex-col transition-colors duration-300">

      {/* Main Content Area */}
      <main className="relative flex-grow flex items-center justify-center p-6 overflow-hidden">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[length:40px_40px] bg-[linear-gradient(to_right,rgba(25,127,230,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(25,127,230,0.1)_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_80%)]"></div>
        </div>
        
        {/* Abstract Decorative Shapes */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl z-0 pointer-events-none"></div>

        <div className="relative z-10 container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left Column: Content & Blueprint Info */}
          <div className="order-2 lg:order-1 flex flex-col justify-center space-y-8 text-center lg:text-left">
            {/* Technical Status Badge */}
            <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-primary/80 font-mono text-xs uppercase tracking-widest mb-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span>System Failure: Error 404</span>
              <span className="w-px h-3 bg-primary/30 mx-2"></span>
              <span>Ref: #NULL_PTR</span>
            </div>

            {/* Main Typography */}
            <div className="space-y-4">
              <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/20 leading-none tracking-tighter drop-shadow-lg text-slate-900 dark:text-white dark:from-white dark:to-white/20">
                404
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight text-slate-900 dark:text-white">
                Yapı <br/><span className="text-primary italic font-serif">Bulunamadı</span>
              </h2>
            </div>

            {/* Divider */}
            <div className="w-24 h-1 bg-primary rounded mx-auto lg:mx-0 opacity-80"></div>

            {/* Descriptive Text */}
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Bu sayfanın planları kayıp veya temel çökmüş görünüyor. Mimari modelimizde talep ettiğiniz koordinatları bulamıyoruz.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link to="/" className="group relative px-8 py-4 bg-primary text-white rounded shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium tracking-wide">Merkeze Dön</span>
              </Link>
              <Link to="/portfolio" className="group px-8 py-4 bg-transparent border border-slate-300 dark:border-slate-700 hover:border-primary text-slate-800 dark:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 flex items-center justify-center gap-3">
                <span className="font-medium tracking-wide">Projeleri İncele</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Technical Footer for 404 */}
            <div className="pt-8 opacity-40 text-xs font-mono uppercase tracking-widest flex flex-col sm:flex-row gap-4 justify-center lg:justify-start text-slate-500">
              <span>Lat: NaN</span>
              <span>Long: NaN</span>
              <span>Elev: 0.00m</span>
            </div>
          </div>

          {/* Right Column: Visual Render */}
          <div className="order-1 lg:order-2 relative h-[400px] lg:h-[600px] flex items-center justify-center group">
            {/* Framing Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-primary/20 rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-primary/20 rounded-bl-3xl"></div>

            {/* Main Image Container with Depth */}
            <div className="relative w-full h-full max-w-lg mx-auto transform transition-transform duration-700 hover:scale-[1.02] perspective-1000">
              {/* Decorative Backdrop Glow */}
              <div className="absolute inset-4 bg-primary/20 blur-[60px] rounded-full z-0"></div>

              {/* Image with overlay/glitch effect hint */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800 bg-slate-900 z-10">
                <img
                    alt="Collapse"
                    className="w-full h-full object-cover opacity-90 grayscale hover:grayscale-0 transition-all duration-500 ease-out"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMMa_UXa5MR0RnzesC5WH9uEWvz6xQ5qZS2l5rGfBXN5Wbh7mLGqQxbhCrtdUsh7rbr6SrpPZPoba_pZmZZlQxMHuIQ84uI9G46mj5m0ogG4b6G_E9GEbFG9-7k15-JVXmzGBuXaXA1QvhgGQLkoJmPrgmIZkQVDK1lQZLrA-bEAfltR3VyEI_Q_pQPDjFyk-4QEW0R-NdJMWzNb7uYtybDwaN6ChysIFBxP8cgwr3ZE13vb9QutITJUfwM84MknWteFSh1FEMDpw"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-80"></div>

                {/* Glitch Lines (CSS only decoration) */}
                <div className="absolute top-1/4 left-0 w-full h-px bg-white/10"></div>
                <div className="absolute bottom-1/3 left-0 w-full h-px bg-white/10"></div>
                <div className="absolute top-1/2 left-1/4 w-px h-32 bg-white/10"></div>
              </div>

              {/* Floating UI Card Overlay */}
              <div className="absolute bottom-8 -left-4 md:-left-12 bg-slate-800/90 backdrop-blur-md border border-slate-700 p-4 rounded-lg shadow-xl z-20 max-w-[200px] transform transition-transform group-hover:-translate-y-2 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="text-yellow-500 w-5 h-5" />
                  <span className="text-xs font-bold text-white uppercase">Uyarı</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed font-mono">
                  Sektör 404'te yapısal bütünlük tehlikeye girdi. Derhal yer değiştirilmesi tavsiye edilir.
                </p>
              </div>

              {/* Floating Coordinates Overlay */}
              <div className="absolute top-12 -right-6 bg-primary text-white px-3 py-1 rounded text-xs font-mono shadow-lg z-20 transform rotate-90 origin-bottom-right">
                ERR_CONNECTION_REFUSED
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="fixed bottom-0 w-full py-4 px-6 border-t border-slate-800 bg-background-dark/80 backdrop-blur-sm z-40 hidden md:block">
        <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
          <div>© 2023 ARCH.STUDIO PORTFOLIO</div>
          <div className="flex gap-4">
            <span>RENDER_TIME: 0.02s</span>
            <span>STATUS: DISCONNECTED</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFoundPage;
