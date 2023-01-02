import React, { useContext, useEffect, useState } from 'react';
import { TreeContext } from '../../contexts/treeContext';
import { getSplitTasksPrompt } from '../../prompts';
import { getBranchById } from '../../pages/openai';
// Tree root state is being prop drilled for now as the 'state' prop, later I will use context for this.
const BranchEditArea = ({
  branchState,
  setBranchState,
  id,
  branchMode,
  setBranchMode,
  fixes,
  setFixes,
}) => {
  // Get the context object containing the root state
  const context = useContext(TreeContext);
  const { rootState } = context;
  const [nodeState, setNodeState] = useState();

  useEffect(() => {
    const state = getBranchById(rootState.subTasks, id);
    setNodeState(state);
  }, [id]);

  const [showEditFixes, setShowEditFixes] = useState(false);

  const handleEditTask = (e) => {
    nodeState.task = e.target.value;
    setBranchState({ ...branchState, task: e.target.value });
  };

  const handleEditPrefix = (e) => {
    fixes[branchMode].prefix = e.target.value;
    setFixes({ ...fixes });
  };

  const handleEditPosfix = (e) => {
    fixes[branchMode].postfix = e.target.value;
    setFixes({ ...fixes });
  };

  const handleChangebranchMode = (e) => {
    setBranchMode(e.target.value);
  };

  return (
    <div
      className='edit-area'
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        alignItems: 'baseline',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <button
          onClick={() => setShowEditFixes((showEditFixes) => !showEditFixes)}
        >
          Show Postfix/prefix
        </button>
        <div
          style={{
            marginLeft: '2rem',
          }}
        >
          <span>Branch Mode: </span>
          <select
            value={branchMode}
            onChange={handleChangebranchMode}
            name='select-branch-mode'
            id='select-branch-mode'
          >
            {Object.keys(fixes).map((branchMode) => (
              <option key={branchMode} value={branchMode}>
                {branchMode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showEditFixes && (
        <>
          <label htmlFor='editPrefix'>Prefix:</label>
          <textarea
            value={fixes[branchMode].prefix}
            style={{ width: '100%', height: '3rem' }}
            onChange={handleEditPrefix}
          />
        </>
      )}
      <label htmlFor='editMainPrompt'>Main Prompt:</label>
      <textarea
        name='editMainPrompt'
        value={branchState.task}
        style={{ width: '100%', height: '3rem' }}
        onChange={handleEditTask}
      />
      {showEditFixes && (
        <>
          <label htmlFor='editPostfix'>Postfix:</label>
          <textarea
            value={fixes.postfix}
            style={{ width: '100%', height: '3rem' }}
            onChange={handleEditPosfix}
            name='editPostFix'
          />
        </>
      )}
    </div>
  );
};

export default BranchEditArea;
