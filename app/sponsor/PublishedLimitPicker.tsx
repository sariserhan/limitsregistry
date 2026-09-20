"use client";
import { useState } from "react";
export type PublishedLimitOption = { id: string; registryNumber: string; title: string; category: string };
export function PublishedLimitPicker({ options, initialLimitId = "", initialQuery = "" }: { options: PublishedLimitOption[]; initialLimitId?: string; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState(initialLimitId);
  const normalized = query.trim().toLocaleLowerCase();
  const matches = options.filter(option => `${option.registryNumber} ${option.title} ${option.category}`.toLocaleLowerCase().includes(normalized));
  const current = options.find(option => option.id === selected);
  const visible = current && !matches.some(option => option.id === selected) ? [current, ...matches] : matches;
  return <>
    <div className="submit-field"><label htmlFor="limit-search">Find a published Limit</label><input id="limit-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search title, category or registry number" aria-describedby="limit-count" /><small id="limit-count" role="status">{matches.length} of {options.length} published Limits match. Clear search to see all.{current && !matches.includes(current) ? " Your selected Limit is kept in the list." : ""}</small></div>
    <div className="submit-field"><label htmlFor="limitId">Published Limit</label><select id="limitId" name="limitId" value={selected} onChange={event => setSelected(event.target.value)} required><option value="">Choose a published Limit</option>{visible.map(option => <option key={option.id} value={option.id}>{option.registryNumber} — {option.title}</option>)}</select>{!matches.length && <small>No matching Limits. Try another search.</small>}</div>
  </>;
}
