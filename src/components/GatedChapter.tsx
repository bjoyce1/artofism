import { useParams } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChapterReader from '@/pages/ChapterReader';

const FREE_CHAPTERS = [1]; // Chapter 1 is free

const GatedChapter = () => {
  const { id } = useParams();
  const chapterNum = parseInt(id || '1', 10);

  if (FREE_CHAPTERS.includes(chapterNum)) {
    return <ChapterReader />;
  }

  return (
    <ProtectedRoute>
      <ChapterReader />
    </ProtectedRoute>
  );
};

export default GatedChapter;
