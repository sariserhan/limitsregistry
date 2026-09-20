"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { manageSponsorship } from "./actions";
export function Controls({id,status,paid,start,end}:{id:string;status:string;paid:boolean;start:string;end:string}) {
  const router=useRouter();const [error,setError]=useState(""),[pending,setPending]=useState(false);
  const submit:React.FormEventHandler<HTMLFormElement>=async event=>{event.preventDefault();const form=new FormData(event.currentTarget);const submitter=(event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement|null;if(submitter)form.set("action",submitter.value);setPending(true);setError("");try{const result=await manageSponsorship(form);if(result.error)setError(result.error);else router.refresh();}catch{setError("Could not save. Please retry.");}finally{setPending(false);}};
  return <div>{error&&<p role="alert">{error}</p>}<form onSubmit={submit}><input type="hidden" name="id" value={id}/><fieldset disabled={pending}>
    {status==="REQUESTED"&&<><label>Listing fee <input name="feeAmount" required pattern="[0-9]{1,8}(\.[0-9]{1,2})?"/></label><label>Fee currency <input name="feeCurrency" required defaultValue="USD" pattern="[A-Z]{3}"/></label><label>Issued invoice reference <input name="invoiceReference" required maxLength={200}/></label><button name="action" value="invoice">Record issued invoice</button></>}
    {status==="INVOICED"&&<><label>Starts at (UTC)<input type="datetime-local" name="startsAt" defaultValue={start} required/></label><label>Ends at (UTC)<input type="datetime-local" name="endsAt" defaultValue={end} required/></label><p>Confirm payment was received externally before marking this term paid. Default term: 90 days; adjust to the agreed invoice and award expiry.</p><button name="action" value="pay">Confirm payment received</button></>}
  </fieldset></form>
  {["REQUESTED","INVOICED","PAID","LAPSED"].includes(status)&&<form onSubmit={submit}><input type="hidden" name="id" value={id}/><fieldset disabled={pending}><label>Cancellation reason <textarea name="note" required minLength={10} maxLength={2000}/></label><p>Cancelling stops placement immediately. It does not issue a refund.</p><button name="action" value="cancel">Cancel term</button></fieldset></form>}
  {paid&&status!=="REFUNDED"&&<form onSubmit={submit}><input type="hidden" name="id" value={id}/><fieldset disabled={pending}><label>Refund explanation <textarea name="note" required minLength={10} maxLength={2000}/></label><label>External full-refund reference <input name="refundReference" required maxLength={200}/></label><p>Record only after the full listing fee has been refunded externally.</p><button name="action" value="refund">Record completed full refund</button></fieldset></form>}
  {paid&&<form onSubmit={submit}><input type="hidden" name="id" value={id}/><button disabled={pending} name="action" value="renew">Create renewal request</button></form>}
  </div>;
}
