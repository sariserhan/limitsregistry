export function MaintenanceScreen({ message }: { message: string | null }) {
  return <main className="maintenance-screen">
    <p className="section-kicker">Limits Registry</p>
    <h1>Under maintenance.</h1>
    <p>{message || "We're making some updates and will be back shortly."}</p>
  </main>;
}
