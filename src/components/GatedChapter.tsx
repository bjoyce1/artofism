import { useParams } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChapterReader from '@/pages/ChapterReader';
import SEO from '@/components/SEO';

const FREE_CHAPTERS = [1]; // Chapter 1 is free

const GatedChapter = () => {
  const { id } = useParams();
  const chapterNum = parseInt(id || '1', 10);

  if (FREE_CHAPTERS.includes(chapterNum)) {
    return <ChapterReader />;
  }

  return (
    <ProtectedRoute
      fallback={
        <SEO
          title={`Chapter ${chapterNum} — The Art of ISM`}
          description={`Chapter ${chapterNum} of The Art of ISM by Mr. CAP. Unlock full access to read.`}
          path={`/chapter/${chapterNum}`}
          noindex
        />
      }
    >
      <ChapterReader />
    </ProtectedRoute>
  );
};

export default GatedChapter;
