const Card = ({ children }) => (
  <div className="hero min-h-64 bg-base-200 rounded-box p-8">
          <div className="hero-content text-center">
            <div className="max-w-md">
              { children }
            </div>
          </div>
        </div>
);

export { Card };
