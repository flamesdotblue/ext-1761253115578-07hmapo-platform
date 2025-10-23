import { useState, useRef, useMemo } from 'react';
import HeroSection from './components/HeroSection';
import AuthPanel from './components/AuthPanel';
import Viewer3D from './components/Viewer3D';
import ConfiguratorPanel from './components/ConfiguratorPanel';
import { Download, FileText, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';

export default function App() {
  const [user, setUser] = useState(null);

  const [selection, setSelection] = useState({
    make: 'Toyota',
    model: 'Supra',
    year: '2022',
  });

  const [config, setConfig] = useState({
    bodyColor: '#2b2b2b',
    interiorColor: '#ff1a1a',
    wheelSize: 1,
    spoiler: true,
  });

  const viewerRef = useRef(null);

  const projectTitle = useMemo(
    () => 'Web-based 3D Car Modification System',
    []
  );

  const onLogin = (profile) => setUser(profile);
  const onLogout = () => setUser(null);

  const handleSaveDesign = () => {
    const key = `design-${Date.now()}`;
    const payload = { user: user?.email || 'guest', selection, config, savedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(payload));
    alert('Design saved to local storage.');
  };

  const exportPNG = async () => {
    const dataUrl = viewerRef.current?.captureImage();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'car-design.png';
    a.click();
  };

  const exportPDF = async () => {
    const dataUrl = viewerRef.current?.captureImage();
    if (!dataUrl) return;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(projectTitle, 40, 40);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`User: ${user?.email || 'Guest'}`, 40, 64);
    pdf.text(`Car: ${selection.make} ${selection.model} (${selection.year})`, 40, 82);
    pdf.text(`Body: ${config.bodyColor} | Interior: ${config.interiorColor} | Wheel Size: ${config.wheelSize.toFixed(2)} | Spoiler: ${config.spoiler ? 'On' : 'Off'}`, 40, 100);

    const imgW = 700;
    const imgH = 394; // maintain 16:9 ratio
    pdf.addImage(dataUrl, 'PNG', 40, 120, imgW, imgH);
    pdf.save('car-design.pdf');
  };

  const exportPPT = async () => {
    const slideTitle = (slide, text) => {
      slide.addText(text, { x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 28, bold: true });
    };
    const addBullets = (slide, items) => {
      slide.addText(items.map((t) => `• ${t}`).join('\n'), {
        x: 0.7,
        y: 1.2,
        w: 11,
        h: 5,
        fontSize: 16,
        lineSpacing: 20,
      });
    };

    const img = viewerRef.current?.captureImage();
    const pptx = new PptxGenJS();

    // Title slide
    let slide = pptx.addSlide();
    slideTitle(slide, projectTitle);
    addBullets(slide, [
      'Major Project Submission',
      `Team/User: ${user?.email || 'Guest'}`,
    ]);

    // Introduction
    slide = pptx.addSlide();
    slideTitle(slide, 'Introduction');
    addBullets(slide, [
      'Interactive web application to visualize and customize cars in 3D.',
      'Leverages modern WebGL libraries and a modular React UI.',
    ]);

    // Objectives
    slide = pptx.addSlide();
    slideTitle(slide, 'Objectives');
    addBullets(slide, [
      'Support ISO-standard car models and metadata.',
      'Enable real-time customization (paint, wheels, spoilers, interior).',
      'Provide save and export capabilities (PNG, PDF, PPT).',
    ]);

    // Architecture
    slide = pptx.addSlide();
    slideTitle(slide, 'System Architecture');
    addBullets(slide, [
      'Frontend: React + Tailwind + Radix UI + Framer Motion.',
      '3D: Three.js for configurator, Spline for hero scene.',
      'Backend (future): Node/Django with SQL/NoSQL for models & users.',
    ]);

    // Tech Stack
    slide = pptx.addSlide();
    slideTitle(slide, 'Tech Stack');
    addBullets(slide, [
      'React, Vite, Tailwind CSS',
      'Three.js, @splinetool/react-spline',
      'jsPDF, PptxGenJS',
    ]);

    // Features
    slide = pptx.addSlide();
    slideTitle(slide, 'Key Features');
    addBullets(slide, [
      'User authentication (client-side prototype).',
      '3D car visualization with camera controls.',
      'Live modifications: color, wheels, spoiler, interior.',
      'Export: PNG, PDF, PPT.',
    ]);

    // Demo Shot
    slide = pptx.addSlide();
    slideTitle(slide, 'Demo Snapshot');
    if (img) {
      slide.addImage({ data: img, x: 0.7, y: 1.2, w: 10.5, h: 5.9 });
    }

    // Future Enhancements
    slide = pptx.addSlide();
    slideTitle(slide, 'Future Enhancements');
    addBullets(slide, [
      'AR/VR visualization in real environments.',
      'Accessories marketplace integration.',
      'AI recommendations for styles and performance impact.',
    ]);

    await pptx.writeFile({ fileName: '3D-Car-Configurator-Presentation.pptx' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white">
      <HeroSection title={projectTitle} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Interactive Configurator</h2>
          <AuthPanel user={user} onLogin={onLogin} onLogout={onLogout} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-neutral-900/60 rounded-xl border border-neutral-800 overflow-hidden">
            <Viewer3D ref={viewerRef} config={config} />
          </div>

          <div className="lg:col-span-4">
            <ConfiguratorPanel
              selection={selection}
              onSelectionChange={setSelection}
              config={config}
              onConfigChange={setConfig}
              onSave={handleSaveDesign}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={exportPNG} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 transition">
            <Download size={18} /> Export PNG
          </button>
          <button onClick={exportPDF} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 transition">
            <FileText size={18} /> Export PDF
          </button>
          <button onClick={exportPPT} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 transition">
            <FileDown size={18} /> Generate PPT
          </button>
        </div>
      </div>
    </div>
  );
}
