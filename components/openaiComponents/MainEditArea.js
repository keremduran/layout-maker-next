import React, { useState, useRef } from 'react';
import { defaultGeneratedImages } from '../testData';
import { TreeContext } from '../contexts/treeContext';
import Loading from '../components/Loading';
import MultiBranch from '../components/openaiComponents/MultiBranch';

export const getData = async (body) => {
  const response = await fetch('/api/openai', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response.json();
};

function removeIdPrefix(string, id) {
  const regex = new RegExp(`^${id}\\S*`);
  return string.replace(regex, '');
}

const splitTextToSubTasks = (text, parentId = '') =>
  text
    .split(/\r\n|\n\r|\n|\r/)
    .filter((subTask) => subTask.length > 2)
    .map((subTask, index) => {
      const id = parentId + (index + 1) + '.';
      return {
        task: removeIdPrefix(subTask, id),
        id: parentId + (index + 1) + '.',
      };
    });

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
  task: {
    prefix: ``,
    postfix: taskPostfix,
  },
  classic: {
    prefix: ``,
    postfix: ``,
  },
  update: {
    prefix: `
      based all the previously mentioned list prompts and responses, continue from the last step, in response to the following prompt:
      `,
    postfix: ``,
  },
};
const getPrompt = (endPoint) => {
  return fetchProps[endPoint].body.requestParams.prompt;
};

const defaultMainPrompt = getPrompt('createCompletion');

const MainEditArea = () => {
  const handleSubmitMainPrompt = () => {
    rootState.mainPrompt = mainPrompt;
    setTreeState({ ...rootState });

    const updatePrefix =
      JSON.stringify(promptHistory) + '\n' + modeDictionary['update'].prefix;
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
      <div style={{ display: 'flex', flexDirection: 'column' }}>
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
  );
};

export default MainEditArea;
