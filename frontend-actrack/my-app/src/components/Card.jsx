const Card = ({ children, maxWidth = "max-w-md" }) => (
  <div className="flex items-center justify-center p-4 w-full">
    <div className={`w-full ${maxWidth}`}>
      <div className="panel p-8 sm:p-10">
        { children }
      </div>
    </div>
  </div>
);

export { Card };
