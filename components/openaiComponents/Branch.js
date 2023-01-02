import MultiBranch from './MultiBranch';

import React, { useState, useContext, useEffect } from 'react';
import BranchEditArea from './BranchEditArea';
import BranchMenuButtons from './BranchMenuButtons';
import { getSplitTasksPrompt } from '../../prompts';
import { TreeContext } from '../../contexts/treeContext';
// Tree root state is being prop drilled for now as the 'state' prop, later I will use context for this.
const Branch = ({ index, parentRef, id }) => {
  // Get the context object containing the root state
  const task = parentRef.task.task;
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [branchState, setBranchState] = useState({
    task,
    subTasks: [],
  });

  const context = useContext(TreeContext);
  const { rootState, programmingLanguage, promptHistory } = context;

  const branchModeDictionary = {
    splitTasks: getSplitTasksPrompt(rootState),
    standalone: {
      prefix: ``,
      postfix: ``,
    },
    conversation: {
      prefix: `This is the conversation history: ${JSON.stringify(
        promptHistory
      )}\n
        Based on the conversation history, continue the thread from the last response, in response to the following prompt:
        `,
      postfix: ``,
    },
    code: {
      prefix: `
        Write the ${programmingLanguage} code to accomplish this step: :
        `,
      postfix: `Return only the finished code.`,
    },
  };

  const [fixes, setFixes] = useState(branchModeDictionary);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    setFixes(branchModeDictionary);
  }, [programmingLanguage]);

  const [branchMode, setBranchMode] = useState('code');
  return (
    <div
      style={{
        marginLeft: '1rem',
      }}
    >
      <div
        key={index}
        className='response-line'
        onMouseEnter={() => setShowButtons(true)}
        onMouseLeave={() => setShowButtons(false)}
      >
        <span
          style={{ whiteSpace: 'pre-wrap', width: `90%`, lineHeight: '150%' }}
        >
          <span className={'line-number'}>{id} </span>

          {editMode ? (
            <BranchEditArea
              branchState={branchState}
              setBranchState={setBranchState}
              branchMode={branchMode}
              setBranchMode={setBranchMode}
              id={id}
              fixes={fixes}
              setFixes={setFixes}
            />
          ) : (
            branchState.task
          )}
        </span>

        {showButtons && (
          <div
            className='task-actions'
            style={{ position: 'absolute', top: 0, right: 0, zIndex: 5 }}
          >
            <BranchMenuButtons
              setEditMode={setEditMode}
              parentRef={parentRef}
              id={id}
              branchState={branchState}
              setBranchState={setBranchState}
              loading={loading}
              setLoading={setLoading}
              branchMode={branchMode}
              fixes={fixes}
            />
          </div>
        )}
      </div>
      {branchState.subTasks.length > 0 && (
        <MultiBranch id={id} subTasks={branchState.subTasks} />
      )}
    </div>
  );
};

export default Branch;
