import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useRef, EffectCallback } from "react";
// Read bible file as static props

export async function getStaticProps() {
  const fs = require("fs");
  const path = require("path");
  const filePath = path.join(process.cwd(), "bible.txt");
  const fileContents = fs.readFileSync(filePath);
  const bible: string = fileContents.toString();

  // Use regex to find all words in bible
  const regex = /\w+/gi;
  const bibleWords = bible.match(regex) ?? [];
  // Get rid of duplicates, and make all lowercase
  const bibleWordsNoDuplicates = Array.from(
    new Set(bibleWords.map((word) => word.toLowerCase()))
  );

  return {
    props: {
      bible,
      bibleWords: bibleWordsNoDuplicates,
    },
  };
}

function useThrottledEffect(
  effect: EffectCallback,
  delay: number,
  deps: any[] = []
) {
  const callback = useRef<EffectCallback>();
  useEffect(() => {
    callback.current = effect;
  }, [effect]);

  useEffect(() => {
    const handler = setTimeout(() => {
      callback?.current?.();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [delay, ...deps]);
}

export default function Home({
  bible,
  bibleWords,
}: {
  bible: string;
  bibleWords: string[];
}) {
  const [text, setText] = useState("");
  const [bibleStats, setBibleStats] = useState({
    totalUnionWords: 0,
    percentage: 0,
  });
  const [bibleWordsSet, setBibleWordsSet] = useState(new Set(bibleWords));

  useEffect(() => {
    const regex = /\w+/gi;
    const textWords = text.match(regex);
    if (!textWords) {
      setBibleStats({ totalUnionWords: 0, percentage: 0 });
      return;
    }
    const totalWords = textWords.length;
    // Find union, but make all lowercase first to avoid false negatives
    const union = textWords
      .map((word) => word.toLowerCase())
      .filter((word) => bibleWordsSet.has(word));
    const totalUnionWords = union.length;
    console.log({ union });

    const percentage = Math.round((totalUnionWords / totalWords) * 100);
    setBibleStats({ totalUnionWords, percentage });
  }, [text]);

  return (
    <>
      <Head>
        <title>None of those words are in the bible</title>
        <meta
          name="description"
          content="Check whether any of those words are in the bible"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {/* Website that checks how many words from a paragraph are in the bible. */}
        {/* Website design: Title, text box, percentage result on bottom, all horizontlaly and vertically centered */}
        {/* Support mobile */}
        {/* Tailwind styles */}
        <div className="flex flex-col items-center justify-center min-h-screen py-2 mx-12 md:mx-5">
          <h1 className="text-3xl md:text-6xl font-bold">
            {`
            ${
              bibleStats.percentage === 0 ? "None" : `${bibleStats.percentage}%`
            }${" "}
            of those words are in the bible`}
          </h1>
          <textarea
            className="w-[90%] md:w-96 h-96 p-4 border-2 border-black"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="text-4xl font-bold">
            {bibleStats.totalUnionWords} words
          </p>
        </div>
      </main>
    </>
  );
}
