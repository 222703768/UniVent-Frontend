import campusImage from "../../assets/cput-campus-background.jpg";

export default function AuthVisualAside() {
  return (
    <aside
      className="relative hidden min-h-screen overflow-hidden bg-cover bg-center p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16"
      style={{
        backgroundImage: `linear-gradient(160deg, rgba(20, 24, 28, .76), rgba(12, 18, 16, .72)), url(${campusImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10 text-lg font-bold">
        UniVent
        <span className="mt-0.5 block text-[11px] font-normal opacity-80">
          University Event Management
        </span>
      </div>

      <div className="relative z-10 max-w-lg">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/75">
          Campus life, connected
        </p>
        <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
          One place for every campus event.
        </h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/85">
          Browse workshops, career fairs, sports days and cultural festivals.
          Register in a click and keep your schedule in one place.
        </p>
        <ul className="mt-7 space-y-3 text-[13px] text-white/90">
          <li className="flex gap-3"><span aria-hidden="true">✓</span><span>Students register for events and manage tickets</span></li>
          <li className="flex gap-3"><span aria-hidden="true">✓</span><span>Organizers publish events after administrator approval</span></li>
          <li className="flex gap-3"><span aria-hidden="true">✓</span><span>Discover what is happening across CPUT campuses</span></li>
        </ul>
      </div>

      <p className="relative z-10 text-xs text-white/70">2026 UniVent · ICT Services</p>
    </aside>
  );
}
