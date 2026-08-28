import { requireRole } from "../../../src/auth/session";
import { listDistinctCategories } from "../../../src/db/repository";
import { createRecord } from "./actions";

type Props = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function CreateRecordPage({ searchParams }: Props) {
  await requireRole("EDITOR");
  const [categories, params] = await Promise.all([listDistinctCategories(), searchParams]);

  return <>
    <p className="section-kicker">New draft</p>
    <h1>Create a record</h1>
    <p className="lede">Starts as a DRAFT, same as any other new Limit — it still needs the normal editorial review (evidence attached, two independent accepted reviews) before it can be published.</p>
    {(params.success || params.error) ? <p className={params.error ? "graph-message graph-error" : "graph-message"} role="status">{params.error ?? params.success}</p> : null}
    <section>
      <form className="bounty-form" action={createRecord}>
        <label>Name<input name="title" minLength={2} maxLength={200} required /></label>
        <label>Metric name<input name="metricName" placeholder="e.g. Compression ratio, Time complexity" minLength={2} maxLength={160} required /></label>
        <label>Field<select name="category" defaultValue=""><option value="">— choose —</option>{categories.map((category) => <option value={category} key={category}>{category}</option>)}</select></label>
        <label>Or a new field name<input name="newCategory" placeholder="e.g. Combinatorics" maxLength={80} /></label>
        <label>Bound type<select name="boundType" defaultValue="" required><option value="" disabled>Choose</option><option value="UPPER_BOUND">Upper bound</option><option value="LOWER_BOUND">Lower bound</option></select></label>
        <label>Bound value<input name="valueExact" placeholder="e.g. O(log n), 42" minLength={1} maxLength={200} required /></label>
        <label>Unit<input name="unit" placeholder="Optional — e.g. bits, seconds" maxLength={40} /></label>
        <label>Source link<input name="evidenceUrl" type="url" pattern="https://.*" placeholder="Optional" /></label>
        <label className="wide">Description<textarea name="summary" minLength={10} maxLength={2000} rows={4} required /></label>
        <label className="wide">Abstract<textarea name="abstract" minLength={10} maxLength={5000} rows={6} required /></label>
        <button type="submit">Create draft record</button>
      </form>
    </section>
  </>;
}
