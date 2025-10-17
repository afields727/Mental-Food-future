import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";

// Small, clean AllergyFlow component
const SAMPLE_CATALOG = {
  fruit: ["apple", "banana", "orange"],
  vegetable: ["tomato", "carrot", "spinach"],
  starch: ["potato", "yam"],
  grain: ["wheat", "rice"],
};

const SUBSTITUTIONS = {
  apple: ["pear", "peach"],
  banana: ["plantain"],
  tomato: ["cucumber"],
};

export default function AllergyFlow({ onComplete }) {
  const [path, setPath] = useState("ask");
  const [confirmed, setConfirmed] = useState(false);
  const { control, register, handleSubmit, watch, setValue } = useForm({ defaultValues: { allergies: [], name: "", email: "" } });
  const { fields, append, remove } = useFieldArray({ control, name: "allergies" });
  const watchAllergies = watch("allergies");

  function startYesPath() {
    setPath("yes");
    if (!watchAllergies || watchAllergies.length === 0) append({ category: "fruit", item: "", allergic: true });
  }
  function startNoPath() {
    setPath("no");
    setValue("allergies", []);
  }
  function startSkipPath() {
    setPath("skip");
  }

  function suggestSubstitutions(item) {
    return SUBSTITUTIONS[item] || [];
  }

  function localToast(msg){ try { console.log('toast:',msg) } catch(e){} }
  async function finish(data) {
    if (!confirmed) return localToast("Please confirm selections before finishing.");
    const payload = { name: data.name, email: data.email, allergies: data.allergies || [], skipAllergies: path === "skip" };
    if (onComplete) onComplete(payload);
    try {
      const res = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Signup failed");
      localToast("Signup successful");
    } catch (err) {
      console.error(err);
      localToast("Signup error");
    }
  }

  return (
    <div style={{ padding: 12 }}>
      {path === "ask" ? (
        <div>
          <h3>Are you allergic to any foods?</h3>
          <div>
            <button onClick={startYesPath}>Yes</button>
            <button onClick={startNoPath}>No</button>
            <button onClick={startSkipPath}>Skip</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(finish)}>
          <div>
            <label>
              Name
              <input {...register("name")} />
            </label>
          </div>
          <div>
            <label>
              Email
              <input {...register("email")} />
            </label>
          </div>

          {path === "yes" && (
            <div>
              {fields.map((f, i) => (
                <div key={f.id} style={{ border: "1px solid #eee", padding: 8, marginBottom: 8 }}>
                  <select {...register(`allergies.${i}.category`)} defaultValue={f.category}>
                    <option value="fruit">Fruit</option>
                    <option value="vegetable">Vegetable</option>
                    <option value="starch">Starch</option>
                    <option value="grain">Grain</option>
                  </select>
                  <input placeholder="item" {...register(`allergies.${i}.item`)} defaultValue={f.item} />
                  <button type="button" onClick={() => remove(i)}>Remove</button>
                </div>
              ))}

              <div>
                {Object.keys(SAMPLE_CATALOG).map((cat) => (
                  <div key={cat}>
                    <strong>{cat}</strong>
                    {SAMPLE_CATALOG[cat].map((it) => (
                      <button key={it} type="button" onClick={() => append({ category: cat, item: it, allergic: true })} style={{ marginLeft: 6 }}>
                        {it}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <label style={{ display: "block", marginTop: 8 }}>
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> I confirm these selections
          </label>

          <div style={{ marginTop: 8 }}>
            <button type="button" onClick={() => setPath("ask")}>Back</button>
            <button type="submit">Finish</button>
          </div>
        </form>
      )}
    </div>
  );
}
