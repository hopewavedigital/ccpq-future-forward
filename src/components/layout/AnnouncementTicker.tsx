export function AnnouncementTicker() {
  const message = "🎉 Current pricing is valid for the first 100 enrolments of 2026 — prices will increase by 30% thereafter!";
  
  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap">
        <span className="mx-8 text-sm font-medium">{message}</span>
        <span className="mx-8 text-sm font-medium">{message}</span>
        <span className="mx-8 text-sm font-medium">{message}</span>
        <span className="mx-8 text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
