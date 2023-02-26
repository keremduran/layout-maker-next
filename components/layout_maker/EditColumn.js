export const EditColumn = ({ props }) => {
  const { location } = props;

  const { tableData, setTableData } = useContext(tableDataContext);

  const handleCopyColumn = () => {
    tableData.rows.forEach((row) => {
      const cell = row.cells[location.j];
      const copiedCell = deepCopy(cell);
      row.cells.splice(location.j, 0, copiedCell);
    });
    setTableData({ ...tableData });
  };

  const handleDelete = () => {
    tableData.rows.forEach((row) => {
      row.cells.splice(location.j, 1);
    });
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

  const columnStuff = {
    addRemove: [
      { type: 'button', label: 'Copy to Right', action: handleCopyColumn },
      { type: 'button', label: 'Delete Col', action: handleDelete },
    ],
    styles: [{ type: 'number', label: 'height', action: handleSetStyle }],
  };

  const [styles, setStyles] = useState({});

  return (
    <div>
      <div>
        {columnStuff.addRemove.map(({ action, label, index }) => (
          <button key={label + index} onClick={action}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
