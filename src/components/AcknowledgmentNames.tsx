export const mentors = ['Mac Drew', 'Robert T', 'Success', 'Lace', 'Love', 'Avalanche', 'Quick', 'Sin', 'Professor', 'Candy Man', 'RIP'];
export const legacy = ['One 4 Da Money', 'Ivory P', 'Dre', 'Crow', 'Wickett Crickett'];
export const circle = ['Young Lace', 'Young Candy', 'Finesse', 'Cash', 'Dallas D', 'No Play', 'Wash', 'Chad', 'Texas Redd'];

const AcknowledgmentNames = ({ names }: { names: string[] }) => (
  <p className="text-center font-display text-sm sm:text-lg leading-relaxed text-foreground/90">
    {names.map((name, index) => (
      <span key={name} className="inline-block">
        {index > 0 && <span aria-hidden="true" className="mx-2 text-primary">·</span>}
        <span className="sr-only">{index > 0 ? ', ' : ''}</span>{name}
      </span>
    ))}
  </p>
);

export default AcknowledgmentNames;