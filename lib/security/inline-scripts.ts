// Runs before first paint: the session's visited flag (first-load motion
// plays once per session), the locale, and the resolved theme, so the page
// never flashes the wrong palette.
export const PREPAINT_SCRIPT =
  'try{var d=document.documentElement;if(sessionStorage.v)d.dataset.visited="";sessionStorage.v=1;d.dataset.locale="en";d.lang="en";var t=localStorage.theme||"system",r=t==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;d.dataset.theme=r==="dark"?"dark":"light"}catch(e){}'
