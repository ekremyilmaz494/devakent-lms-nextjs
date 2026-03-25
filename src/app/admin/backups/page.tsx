export default function AdminBackups() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Veritabani Yedekleme
        </h1>
        <p className="text-sm text-muted-foreground">
          Otomatik ve manuel yedekleme yonetimi.
        </p>
      </div>
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-border bg-card">
        <p className="text-sm text-muted-foreground">
          Yedekleme modulu — sonraki fazda
        </p>
      </div>
    </div>
  );
}
