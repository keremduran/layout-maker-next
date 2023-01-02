import { getData, fetchProps } from '..';
import { useState } from 'react';
import styles from '../styles/SentimentAnalysis.module.css';

const defaultSentimentFrequencies = [
  {
    text: 'I am overwhelmed with emotions as I sit here and try to put into words the depth of my feelings.',
    sentiments: { happy: '70%', sad: '30%', neutral: '40%', angry: '10%' },
  },
  {
    text: 'The love I have for you is boundless and all-consuming.',
    sentiments: { happy: '90%', sad: '10%', neutral: '20%', angry: '0%' },
  },
  {
    text: 'Filling me with a sense of warmth and joy that radiates through every part of my being.',
    sentiments: { happy: '80%', sad: '20%', neutral: '30%', angry: '10%' },
  },
  {
    text: 'When I think about the future, I am filled with excitement and anticipation at the thought of spending the rest of my days by your side.',
    sentiments: { happy: '90%', sad: '10%', neutral: '20%', angry: '0%' },
  },
  {
    text: 'Every moment we spend together is a treasure to me, and I am grateful beyond measure for the opportunity to love and be loved by you.',
    sentiments: { happy: '80%', sad: '20%', neutral: '30%', angry: '10%' },
  },
  {
    text: 'But even as I am filled with happiness, I am also plagued by fear.',
    sentiments: { happy: '60%', sad: '40%', neutral: '30%', angry: '10%' },
  },
  {
    text: 'The thought of losing you is unbearable, and the prospect of a future without you fills me with dread.',
    sentiments: { happy: '40%', sad: '60%', neutral: '30%', angry: '10%' },
  },
  {
    text: 'I cannot imagine my life without you in it, and the very thought of it brings tears to my eyes.',
    sentiments: { happy: '20%', sad: '80%', neutral: '30%', angry: '10%' },
  },
  {
    text: 'Yet even in the face of this fear, I know that I must embrace the love we have and hold on to it with all my might.',
    sentiments: { happy: '60%', sad: '40%', neutral: '30%', angry: '10%' },
  },
  {
    text: 'For you are my everything, the light that guides me through the darkness and the source of all my happiness.',
    sentiments: { happy: '80%', sad: '20%', neutral: '30%', angry: '10%' },
  },
  {
    text: 'I love you with all my heart and soul, and I will always be here for you, through every joy and every challenge that life may bring our way.',
    sentiments: { happy: '70%', sad: '30%', neutral: '40%', angry: '10%' },
  },
];

const defaultText = `
I am overwhelmed with emotions as I sit here and try to put into words the depth of my feelings. The love I have for you is boundless and all-consuming, filling me with a sense of warmth and joy that radiates through every part of my being.

When I think about the future, I am filled with excitement and anticipation at the thought of spending the rest of my days by your side. Every moment we spend together is a treasure to me, and I am grateful beyond measure for the opportunity to love and be loved by you.

But even as I am filled with happiness, I am also plagued by fear. The thought of losing you is unbearable, and the prospect of a future without you fills me with dread. I cannot imagine my life without you in it, and the very thought of it brings tears to my eyes.

Yet even in the face of this fear, I know that I must embrace the love we have and hold on to it with all my might. For you are my everything, the light that guides me through the darkness and the source of all my happiness. I love you with all my heart and soul, and I will always be here for you, through every joy and every challenge that life may bring our way.`;

const sentimentColorDictionary = {
  happy: '#FFFFA7',
  sad: '#add8e6',
  neutral: '#d3d3d3',
  angry: '#ffc0cb',
  overwhelmed: '#FFD1DC',
  fearful: '#CBC3E3',
  frustrated: '#FFC0CB',
  anxious: '#FFE4C4',
  determined: '#FFEC8B',
  content: '#F0FFF0',
  adoration: '#FFF0F5',
  devotion: '#FFDAB9',
  passionate: '#FFE4E1',
  excited: '#FFFACD',
  optimistic: '#FAFAD2',
  eager: '#FFEFD5',
  hope: '#F0FFF0',
  grateful: '#F5FFFA',
  thankful: '#F0FFF0',
  blessed: '#F5FFFA',
  appreciative: '#F0FFF0',
  afraid: '#E6E6FA',
  worried: '#F0E68C',
  nervous: '#FFF8DC',
  insecure: '#FFFAFA',
  despair: '#FFF0F5',
  heartbroken: '#FFD2E9',
  miserable: '#FFFAFA',
  frustrated: '#FFC0CB',
  disappointed: '#F5F5F5',
  helpless: '#FFFAFA',
  resolved: '#FFE4B5',
  determined: '#FFEC8B',
  confident: '#FAFAD2',
  grateful: '#F5FFFA',
  appreciative: '#F0FFF0',
  devoted: '#FFDAB9',
  committed: '#F0FFF0',
  loyal: '#F5FFFA',
};

const sampleData = [
  {
    text: 'sentence1',
    sentiments: {
      emotion1: '70%',
      emotion2: '30%',
      emotion3: '40%',
      emotion4: '10%',
    },
  },
  {
    text: 'sentence',
    sentiments: {
      emotion1: '90%',
      emotion2: '10%',
      emotion3: '20%',
      emotion4: '0%',
    },
  },
  {
    text: 'sentence',
    sentiments: {
      emotion1: '90%',
      emotion2: '10%',
      emotion3: '20%',
      emotion4: '0%',
    },
  },
];

const SentimentAnalysis = () => {
  const App = () => {
    const [mainPrompt, setMainPrompt] = useState(defaultText);
    const [errorCount, setErrorCount] = useState(0);
    const MAX_ERROR_COUNT = 5;

    const [sentimentFrequencies, setSentimenFrequencies] = useState(
      defaultSentimentFrequencies
    );
    var [loading, setLoading] = useState(false);
    const [promptHistory, setPromptHistory] = useState([{}]);

    function fetchCompletion({ prompt, setter, setLoading }) {
      const { body } = fetchProps['createCompletion'];
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

    const setter = (res) => {
      let sentimentFrequencyArray = [];
      const text = res.choices[0].text;
      console.log('setter text: ', text);
      sentimentFrequencyArray = JSON.parse(text);
      console.log('set sfa: ', sentimentFrequencyArray);
      setSentimenFrequencies(sentimentFrequencyArray);
    };

    const handleEditText = (e) => {
      const text = e.target.value;
      setMainPrompt(text);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      // const prompt = `${mainPrompt}
      //   \nDivide the previously mentioned paragraphs into sentences and prompt a Javascript array that holds the sentiment level (least happy 0%, most happy 100%) of those sentences in the following format:
      //   ${JSON.stringify(sampleData)}`;

      const prompt = `Read the following text: ${mainPrompt.replace(`\n`, '')}
			\nPrompt a Javascript array that holds the sentiment level (least happy 0%, most happy 100%) of every sentence of the text in the following format (identify at least 6 different emotions and replace the placeholder emotion1 emotion2 with identified emotions like happy, sad, etc.):
${JSON.stringify(sampleData)}`;

      // Utilize the OpenAI API to read the paragraph and create a sentiment frequency by sentence array in the setter function
      try {
        fetchCompletion({ prompt, setter, setLoading });
      } catch (error) {
        const errorPrompt = `Fix the following error: ${error.toString()}
        With the data that is received from OpenAI ChatGpt response to this prompt ${prompt}
        Send the correct data format to be used at the following javascript line "sentimentFrequencyArray = JSON.parse(res.choices[0].text);"`;

        console.error(errorPrompt);
      }
    };

    return (
      <div style={{ color: 'white' }}>
        {loading && 'loading...'}
        <form onSubmit={handleSubmit}>
          <textarea
            style={{
              padding: '0.1rem 0.5rem',
              width: '70%',
              height: '5rem',
            }}
            value={mainPrompt}
            onChange={handleEditText}
          />
          <button type='submit' disabled={loading}>
            Submit
          </button>
        </form>
        <div style={{ display: 'inline-block' }}>
          {sentimentFrequencies &&
            sentimentFrequencies.map((sentence, index) => {
              return (
                <div key={sentence + index}>
                  <span>{sentence.text}</span>
                  <div
                    key={sentence.text}
                    style={{
                      display: 'flex',
                      justifyContent: 'left',
                      //width: sentence.text.length / 2.25 + 'rem',
                      maxWidth: '90vw',
                    }}
                  >
                    {Object.keys(sentence.sentiments).map((sentiment, i) => {
                      const intensity = sentence.sentiments[sentiment];
                      const backgroundColor =
                        sentimentColorDictionary[sentiment];
                      return (
                        <div
                          key={sentence + sentiment + i}
                          className={styles.tooltip}
                          style={{
                            backgroundColor: backgroundColor,
                            width: intensity,
                            fontSize: '0.8rem',
                          }}
                        >
                          <span className={styles.tooltipText}>
                            {sentiment}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };
  return <App />;
};

export default SentimentAnalysis;
