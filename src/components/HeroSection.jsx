import Spline from '@splinetool/react-spline';

export default function HeroSection({ title }) {
  return (
    <section className="relative h-[60vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/m8wpIQzXWhEh9Yek/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black pointer-events-none" />

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 text-neutral-300 max-w-2xl">
          Customize ISO-standard car models in an immersive 3D environment. Paint, wheels, spoilers, interiors and more — then save or export your creation.
        </p>
      </div>
    </section>
  );
}
