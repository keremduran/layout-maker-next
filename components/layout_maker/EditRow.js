const EditRow = ({ props }) => {
  const { location } = props;

  const { tableData, setTableData } = useContext(tableDataContext);

  const currentStyles = tableData.rows[location.i].styles;

  const handleCopyBelow = () => {
    const row = tableData.rows[location.i];
    const copiedRow = deepCopy(row);
    tableData.rows.splice(location.i, 0, copiedRow);
    tableData.selectedCells = [];
    setTableData({ ...tableData });
  };

  const handleDelete = () => {
    tableData.selectedCells = [];
    tableData.rows.splice(location.i, 1);
    setTableData({ ...tableData });
  };

  const handleSetStyle = (e, styleName) => {
    styles[styleName] = e.target.value;
    setStyles({ ...styles });
    const row = tableData.rows[location.i];

    try {
      row.styles[styleName] = Number(styles[styleName]) + 'px';
    } catch (error) {
      console.log(error);
    }

    setTableData({ ...tableData });
  };

  const rowStuff = {
    addRemove: [
      { type: 'button', label: 'Copy Below', action: handleCopyBelow },
      { type: 'button', label: 'Delete Row', action: handleDelete },
    ],
    styles: [{ type: 'number', label: 'height', action: handleSetStyle }],
  };

  const currentStyleValues = {};

  //Extracting style number value from style like '1px' to 1
  const initRowStyleValues = () => {
    const heightStyle = currentStyles['height'];
    if (heightStyle) {
      const heightValue = Number(heightStyle.split('px')[0]);
      currentStyleValues['height'] = heightValue;
      setStyles({ ...currentStyleValues });
    }
  };

  useEffect(initRowStyleValues, []);

  const [styles, setStyles] = useState({});

  return (
    <div>
      <h3>Row All Styles</h3>
      <div>
        <div>
          {rowStuff.addRemove.map(({ action, label, index }) => (
            <button key={label + index} onClick={action}>
              {label}
            </button>
          ))}
        </div>
        <div className='context-menu-input-elements'>
          {rowStuff.styles.map(({ action, label, index }) => (
            <span key={label + index}>
              <label htmlFor={label}>{label}</label>
              <input
                key={`InputElement${index}`}
                type='number'
                name={label}
                min={0}
                value={styles[label]}
                onChange={(e) => action(e, label)}
              />
            </span>
          ))}
        </div>
        <div></div>
      </div>
    </div>
  );
};
