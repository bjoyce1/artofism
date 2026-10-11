const AcknowledgmentNames = ({ names }: { names: string[] }) => (
  <p className="text-center font-display text-sm sm:text-lg leading-normal sm:leading-relaxed text-foreground/90">
    {names.map((name, index) => (
      <span key={name} className="inline-block">
        {index > 0 && <span aria-hidden="true" className="mx-1.5 sm:mx-2 text-primary">·</span>}
        <span className="sr-only">{index > 0 ? ', ' : ''}</span>{name}
      </span>
    ))}
  </p>
);

export default AcknowledgmentNames;