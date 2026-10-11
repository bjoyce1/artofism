import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AlbumDownload = () => (
  <Button asChild variant="outline" size="lg" className="max-w-full px-3 sm:px-6 border-primary/30 text-primary font-ui text-xs sm:text-sm">
    <a href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/music/The%20Art%20of%20ISM%20Album.zip`} download>
      <Download aria-hidden="true" />Download the Art of ISM Album
    </a>
  </Button>
);

export default AlbumDownload;