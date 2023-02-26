import Table from './Table';
export const Insert = ({ location }) => {
  const insertStyleNames = ['table'];
  const { tableData, setTableData } = useContext(tableDataContext);
  const [tableDimensions, setTableDimensions] = useState({ rows: 3, cols: 3 });
  const { i, j } = location;

  const handleInsertTable = () => {
    const children = tableData.rows[i].cells[j].children;
    const { rows, cols } = tableDimensions;
    const insertTableData = createTableData(rows, cols);
    const newTable = <Table props={{ tableData: insertTableData }} />;
    children.push(newTable);
    setTableData({ ...tableData });
  };

  const handleSetTableRows = (e) => {
    tableDimensions.rows = e.target.value;
    setTableDimensions({ ...tableDimensions });
  };

  const handleSetTableCols = (e) => {
    tableDimensions.cols = e.target.value;
    setTableDimensions({ ...tableDimensions });
  };

  return (
    <div>
      <h3>Insert</h3>
      <div className='context-menu-input-elements'>
        {insertStyleNames.map((styleName, index) => {
          return (
            <span key={`InputElement${index}`}>
              {styleName === 'table' && (
                <span>
                  <label htmlFor='cols'>Cols</label>
                  <input
                    type='number'
                    name={'cols'}
                    value={tableDimensions.cols}
                    onChange={handleSetTableCols}
                  />

                  <label htmlFor='rows'>Rows</label>
                  <input
                    type='number'
                    name={'rows'}
                    value={tableDimensions.rows}
                    onChange={handleSetTableRows}
                  />
                  <button disabled={false} onClick={handleInsertTable}>
                    Insert Table {`(under contruction)`}
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
