const EditTable = ({ props }) => {
  // const { styles: tableStyles, location } = props;

  const tableStyleNames = ['width', 'height', 'allBorders', 'borderCollapse'];

  const { tableData, setTableData } = useContext(tableDataContext);

  const [styles, setTableStyles] = useState({});

  const initTableStyles = () => {};

  useEffect(initTableStyles, []);

  const handleSetStyle = (e, styleName) => {
    if (Number(e.target.value) < 0) return;

    if (styleName === 'allBorders') {
      tableData.rows.forEach((row) => {
        row.cells.forEach((cell) => {
          borderStyleNames.forEach((styleName) => {
            if (styleName === 'border') return;
            const borderValue = e.target.value;
            setTableStyles({ ...styles, allBorders: borderValue });
            cell.styles[styleName] = borderValue + 'px solid black';
          });
        });
      });
      setTableData({ ...tableData });
      return;
    }

    styles[styleName] = e.target.value;

    setTableStyles(styles);

    tableData.styles[styleName] = `${styles[styleName]}%`;
    setTableData({ ...tableData });
  };

  const handleBorderCollapse = (e) => {
    tableData.rows.forEach((row) => {
      row.cells.forEach((cell) => {
        const { i, j } = cell.location;

        const lastRow = i === tableData.rows.length - 1;
        const lastCol = j === row.cells.length - 1;

        if (!lastCol) cell.styles['borderRight'] = '0px solid black';
        if (!lastRow) cell.styles['borderBottom'] = '0px solid black';
      });
    });

    setTableData({ ...tableData });
  };

  return (
    <div>
      <h3>Table All Styles</h3>
      <div className='context-menu-input-elements'>
        {tableStyleNames.map((styleName, index) => {
          return (
            <span key={`InputElement${index}`}>
              {['width', 'height', 'allBorders'].includes(styleName) && (
                <span>
                  <label htmlFor={styleName}>
                    {styleName}
                    {['width', 'height'].includes(styleName) && ' (%)'}
                  </label>
                  <input
                    type='number'
                    name={styleName}
                    min={0}
                    value={styles[styleName] ? styles[styleName] : 1}
                    onChange={(e) => handleSetStyle(e, styleName)}
                  />
                </span>
              )}
              {styleName === 'borderCollapse' && (
                <span>
                  <br />
                  <button onClick={handleBorderCollapse}>
                    Border Collapse
                  </button>
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};
