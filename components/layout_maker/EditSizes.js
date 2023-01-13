export const EditSizes = ({ props }) => {
  const { styles: cellStyles, location } = props;

  const sizeStyleNames = ['height'];

  const { tableData, setTableData } = useContext(tableDataContext);

  const defaultSizes = {};

  const [sizes, setSizes] = useState({});

  const initSizes = () => {
    Object.keys(cellStyles).forEach((styleName) => {
      const sizeCriteria = (sizeStyleName) => sizeStyleName === styleName;
      const sizeFound = sizeStyleNames.find(sizeCriteria);
      if (sizeFound) {
        const sizeName = styleName;
        defaultSizes[sizeName] = Number(cellStyles[sizeName].split('px')[0]);
        setSizes(defaultSizes);
      }
    });
  };

  useEffect(initSizes, []);

  const handleSetSize = (e, sizeName) => {
    if (Number(e.target.value) < 0) return;

    sizes[sizeName] = e.target.value;

    setSizes(sizes);

    const cell = tableData.rows[location.i].cells[location.j];
    cell.styles[sizeName] = `${sizes[sizeName]}px`;
    setTableData({ ...tableData });
  };

  return (
    <div>
      <h3>Sizes</h3>
      <div className='context-menu-input-elements'>
        {sizeStyleNames.map((sizeName, index) => {
          return (
            <span key={sizeName + '' + index}>
              <label htmlFor={sizeName}>
                {sizeName === 'size' ? 'All' : sizeName.replace('size', '')}
              </label>
              <input
                key={`InputElement${index}`}
                type='number'
                name={sizeName}
                min={0}
                value={sizes[sizeName]}
                onChange={(e) => handleSetSize(e, sizeName)}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
};
