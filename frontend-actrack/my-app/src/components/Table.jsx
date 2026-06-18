const Table = ({ object }) => {
  return (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            {Object.keys(object[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Item key={object.id} object={object} />
        </tbody>
      </table>
    </div>
  );
};

const Item = ({ object }) => {
  return (
    <>
      {object.map((item, index) => (
        <tr key={index}>
          <th>{index + 1}</th>
          {Object.values(item).map((valor, i) => (
            <td key={i}>{valor}</td>
          ))}
        </tr>
      ))}
    </>
  );
};
export default Table;

// <Navlink to={`/devices/${item.id}`}></Navlink>
