import { OPENAI_API_KEY } from "$env/static/private";
import OpenAI from "openai";
import type {Customisation} from "$lib/types/Customisation";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// we assumed that transcript_code is a string of LaTeX code containing the summary
export async function format(transcript_code: string, Customisations: Customisation){

  let highlight_phrase = "";
  if (Customisations.highlight_keywords){
    highlight_phrase = " highlight keywords ";
  }
  
  let questions_phrase = "";
  if (Customisations.questions){
    questions_phrase = " with a revision question answer section"
  }

  // adds length prompt for length upper bound in pages, default set to 1
  let length_phrase = "";
  if (Customisations.length != -1){
    if (Customisations.length == 1){
      length_phrase = " in 1 page ";
    } else {
      length_phrase = " in " + Customisations.length + " pages ";
    } 
  }
  
  const prompt = "Plase give me this LaTeX code, " + length_phrase + highlight_phrase + Customisations.summary_format + questions_phrase +" :" + transcript_code;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: prompt}],
      model: "gpt-3.5-turbo",
  });

  const summary = completion.choices[0]["message"]["content"];

  console.log("Prompt : ");
  console.log(prompt);
  console.log("Customised Code : ");
  console.log(summary);
        
  return summary;
}