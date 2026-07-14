const Card = ({ children }) => (
  <div className="flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-shadow hover:shadow-md">
        { children }
      </div>
    </div>
  </div>
);

export { Card };
