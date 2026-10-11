import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AcknowledgmentNames, { mentors, legacy, circle } from './AcknowledgmentNames';
import AlbumDownload from './AlbumDownload';

const AcknowledgmentsPreview = () => (
  <section id="acknowledgments" className="relative py-16 md:py-24 px-6 text-center bg-deep-black">
    <div className="max-w-3xl mx-auto space-y-3">
      <h2 className="font-display text-3xl sm:text-5xl text-foreground">Acknowledgments</h2>
      <p className="font-display text-primary italic">No journey is built alone.</p>
      <p className="text-xs sm:text-sm text-muted-foreground">This section honors those who were part of the journey.</p>
      <AcknowledgmentNames names={[...mentors, ...circle, 'Mr. CAP International']} />
      <div>
        <p className="font-ui text-[10px] text-muted-foreground mb-1">In memory</p>
        <AcknowledgmentNames names={legacy} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <Button asChild variant="link" className="text-xs sm:text-sm px-0"><Link to="/acknowledgments">Read the full acknowledgments →</Link></Button>
        <AlbumDownload />
      </div>
    </div>
  </section>
);

export default AcknowledgmentsPreview;