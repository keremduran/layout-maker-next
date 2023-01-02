import React, { useState, useRef } from 'react';
import { defaultGeneratedImages } from '../../testData';
import { TreeContext } from '../../contexts/treeContext';
import Loading from '../../components/Loading';
import MultiBranch from '../../components/openaiComponents/MultiBranch';
import { splitTextToSubTasks } from '../../prompts';

export const getData = async (body) => {
  const response = await fetch('/api/openai', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response.json();
};

export const fetchProps = {
  createImage: {
    body: {
      type: 'createImage',
      requestParams: {
        prompt: 'Beautiful magical underwater city.',
        n: 5,
        size: '1024x1024',
      },
    },
    defaultData: defaultGeneratedImages,
  },
  createCompletion: {
    body: {
      type: 'createCompletion',
      requestParams: {
        model: 'text-davinci-003',
        prompt: `Create development plan for a functional component-driven react application that uses openai api to read a paragraph from user input, and creates a 'sentiment frequency by sentence' array from that paragraph, and creates a sentiment color UI mapping of the array using the color range of red (happy) to blue (sad).`,
        max_tokens: 2000,
        temperature: 0,
      },
    },
  },
};

const taskPostfix = `
Then list the steps to make this idea happen in a way that openai can accomplish every step.
Use a commanding tone.
and don't prompt everything only prompt the new subtasks.
Do not number or prefix any new line.
and don't send prefix the list with anything, such as by Steps: or Subtasks: or Updated Node: `;

const modeDictionary = {
  splitTasks: {
    prefix: ``,
    postfix: taskPostfix,
  },
  standalone: {
    prefix: ``,
    postfix: ``,
  },
  conversation: {
    prefix: `
    based all the previously mentioned list prompts and responses, continue from the last step, in response to the following prompt:
    `,
    postfix: ``,
  },
};

const programmingLanguages = ['python', 'javascript'];

const getPrompt = (endPoint) => {
  return fetchProps[endPoint].body.requestParams.prompt;
};

export function getBranchById(data, id) {
  console.log({ rootStateSubtasks: data, id });
  if (!data || !id) return null;

  for (const node of data) {
    if (node.id === id) {
      return node;
    }
    if (node.subTasks) {
      const foundNode = getBranchById(node.subTasks, id);
      if (foundNode) {
        return foundNode;
      }
    }
  }

  return null;
}

const defaultMainPrompt = getPrompt('createCompletion');

const OpenAI = () => {
  const [promptHistory, setPromptHistory] = useState([{}]);
  const [loading, setLoading] = useState(false);
  const [mainPrompt, setMainPrompt] = useState(defaultMainPrompt);
  const [treeState, setTreeState] = useState({ mainPrompt, subTasks: [] });
  const [mode, setMode] = useState('splitTasks');
  const [programmingLanguage, setProgrammingLanguage] = useState('javascript');

  const rootStateRef = useRef(treeState);
  const rootState = rootStateRef.current;
  const getRootStateString = () => JSON.stringify(rootState);

  const { postfix, prefix } = modeDictionary[mode];

  function fetchOpenAIData({ prompt, type, setter, setLoading }) {
    const { body } = fetchProps[type];
    body.requestParams.prompt = prompt;
    setLoading(true);
    getData(body)
      .then((res) => {
        console.log('openai response client: ', res);
        setLoading(false);

        setPromptHistory((responses) => [
          ...responses,
          { mainPrompt, res: res.choices[0].text },
        ]);

        if (setter) setter(res);
        else console.error('no setter!');
      })
      .catch((error) => {
        console.error(error);
        //setData([...data, defaultData]);
      });
  }

  const updateThread = (res) => {
    const text = res.choices[0].text;
    if (!text) return;

    const subTasks = splitTextToSubTasks(text);
    rootState.subTasks = rootState.subTasks.concat(subTasks);
  };

  const handleEditText = (e) => {
    const text = e.target.value;
    setMainPrompt(text);
  };

  const setter = (res) => {
    console.log('openai response at client', res);
    updateThread(res);
    setTreeState({ ...rootState });
  };

  const handleSubmitMainPrompt = () => {
    rootState.mainPrompt = mainPrompt;
    setTreeState({ ...rootState });

    const updatePrefix =
      JSON.stringify(promptHistory) +
      '\n' +
      modeDictionary['conversation'].prefix;
    const prompt = prefix + mainPrompt + updatePrefix + postfix;

    fetchOpenAIData({
      prompt,
      type: 'createCompletion',
      setter,
      setLoading,
    });
  };

  const handleRefresh = () => {
    const entireTree = JSON.stringify(rootState);
    let prompt = `This the responses json '${entireTree}'
    Rewrite all of that in a unique way. Try to take a different approach but keep the formatting of the data so that 'JSON.parse(res.choices[0].text);' doesn't fail.`;

    const setter = (res) => {
      const taskList = res.choices[0].text;
      if (!taskList) return;

      let newTasks;

      try {
        newTasks = JSON.parse(taskList);
      } catch (error) {
        const errorPostfix = `\nSolve this error:\n${JSON.stringify(error)}`;

        fetchOpenAIData({
          prompt: prompt + errorPostfix,
          type: 'createCompletion',
          setter,
          setLoading,
        });
      }

      rootStateRef.current = { ...newTasks };
      setTreeState({ ...newTasks });
    };

    fetchOpenAIData({
      prompt,
      type: 'createCompletion',
      setter,
      setLoading,
    });
  };

  const handleChangeMode = (e) => {
    setMode(e.target.value);
  };

  return (
    // Root of the tree, TaskList -> Task -> TaskList is recursive
    <div style={{ color: 'white' }}>
      {loading && <Loading />}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <textarea
          style={{
            padding: '0.1rem 0.5rem',
            width: '70%',
            height: 'max-content(2rem)',
          }}
          value={mainPrompt}
          onChange={handleEditText}
        />
        <div className={'main-edit'}>
          <span>Code</span>
          <input
            type='text'
            value={programmingLanguage}
            onChange={(e) => setProgrammingLanguage(e.target.value)}
          />
          <span>Mode</span>
          <select
            value={mode}
            onChange={handleChangeMode}
            name='select-mode'
            id='select-mode'
          >
            {Object.keys(modeDictionary).map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
          <button onClickCapture={handleSubmitMainPrompt}>Submit</button>
          <button onClickCapture={handleRefresh}>Refresh</button>
        </div>
      </div>
      {/* Recursion starts. */}
      {treeState.subTasks && (
        <TreeContext.Provider
          value={{
            treeState,
            setTreeState,
            fetchOpenAIData,
            rootState,
            programmingLanguage,
            setProgrammingLanguage,
            promptHistory,
            setPromptHistory,
          }}
        >
          <MultiBranch
            // It is the divided /n version of the text response
            id={''}
            subTasks={treeState.subTasks}
          />
        </TreeContext.Provider>
      )}
    </div>
  );
};

export default OpenAI;
