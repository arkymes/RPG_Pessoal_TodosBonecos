export const fetchWithFallback = async (targetUrl: string): Promise<string> => {
  const proxies = [
      async () => {
          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
          if (!res.ok) throw new Error('Status ' + res.status);
          const data = await res.json();
          return data.contents;
      },
      async () => {
          const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
          if (!res.ok) throw new Error('Status ' + res.status);
          return await res.text();
      },
      async () => {
          const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
          if (!res.ok) throw new Error('Status ' + res.status);
          return await res.text();
      }
  ];

  for (const proxy of proxies) {
      try {
          const result = await proxy();
          if (result && result.length > 100) return result; 
      } catch (e) {
          console.warn("Proxy failed, trying next...", e);
      }
  }
  throw new Error("Failed to fetch data from Wikidot.");
};

export const slugifySpell = (name: string) => {
  return 'spell:' + name.toLowerCase().replace(/[']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

export const parseSpellPage = (htmlContent: string, pageTitleFallback: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const pageContent = doc.getElementById('page-content');
  const pageTitle = doc.querySelector('.page-title')?.textContent || pageTitleFallback;
  
  if (!pageContent) throw new Error("Estrutura da página desconhecida.");
  
  let spellData = {
      name: pageTitle,
      level: 0,
      school: "",
      castingTime: "-",
      range: "-",
      components: "-",
      duration: "-",
      description: "",
      source: ""
  };

  const children = Array.from(pageContent.children);
  let statsFound = false;
  let descLines: string[] = [];
  
  for (const node of children) {
      const text = node.textContent?.trim() || "";
      const tagName = node.tagName;
      
      // 1. Source (usually first)
      if (text.startsWith("Source:")) {
          spellData.source = text.replace("Source:", "").trim();
          continue;
      }

      // 2. School/Level Line
      if (!statsFound && tagName === 'P' && node.querySelector('em') && !text.includes(':')) {
          if (text.length < 80) {
              spellData.school = text;
              if (text.toLowerCase().includes('cantrip')) {
                  spellData.level = 0;
              } else {
                  const match = text.match(/\d+/);
                  if (match) spellData.level = parseInt(match[0]);
              }
              continue;
          }
      }

      // 3. Stats Block
      if (!statsFound && (text.includes("Casting Time:") || text.includes("Tempo de Conjuração:"))) {
          statsFound = true;
          const parts = node.innerHTML.split(/<br\s*\/?>/i);
          parts.forEach(part => {
              const div = document.createElement('div');
              div.innerHTML = part;
              const cleanPart = div.textContent?.trim() || "";
              
              if (cleanPart.match(/^(Casting Time|Tempo de Conjuração):/i)) spellData.castingTime = cleanPart.split(':')[1].trim();
              if (cleanPart.match(/^(Range|Alcance):/i)) spellData.range = cleanPart.split(':')[1].trim();
              if (cleanPart.match(/^(Components|Componentes):/i)) spellData.components = cleanPart.split(':')[1].trim();
              if (cleanPart.match(/^(Duration|Duração):/i)) spellData.duration = cleanPart.split(':')[1].trim();
          });
          continue;
      }

      // 4. Description Content
      if (statsFound) {
          if (tagName === 'UL' || tagName === 'OL') {
              const items = Array.from(node.querySelectorAll('li')).map(li => `• ${li.textContent?.trim()}`);
              descLines.push(items.join('\n'));
          } else if (tagName === 'TABLE') {
               const rows = Array.from(node.querySelectorAll('tr')).map(tr => {
                   return Array.from(tr.querySelectorAll('td,th')).map(td => td.textContent?.trim()).join(' | ');
               });
               descLines.push(rows.join('\n'));
          } else {
              let lineText = text;
              const bold = node.querySelector('strong');
              if (bold && text.startsWith(bold.textContent || "")) {
                  lineText = `**${bold.textContent}** ${text.substring(bold.textContent?.length || 0)}`;
              }
              if (lineText) descLines.push(lineText);
          }
      }
  }

  // Fallback
  if (!statsFound && descLines.length === 0) {
     children.forEach(el => {
         const t = el.textContent?.trim() || "";
         if (el.tagName === 'P' && !t.startsWith("Source:") && !t.includes("Spell Lists") && t.length > 20) {
             descLines.push(t);
         }
     });
  }

  spellData.description = descLines.join('\n\n');
  return spellData;
};
