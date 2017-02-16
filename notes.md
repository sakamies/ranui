- The visualised syntax could inform keyboard shortcuts
  - So if the visuals showed `<div attr="value">` then you'd create new element by typing `<` and after writing the tag name `div` you'd make an attribut by pressing space. If you were writing an attribute name, you'd press `=` to add a value.
  - Same for just `div attr:value` you'd add a div by typing lowercase, add and attr with space and add a value to attr with `:`

- Visualised syntax doesn't need to be limited to syntax highlight! For example a php snippet could have a small visual annotation box over it that says [php]

- Selection model needs figuring out. Potato had a model where you select either rows or props and that has the nice benefit of preventing nonsensical selections. In Ranui you can select a bunch of properties and a tag and when you drag them, the app combines lonely props into the first tag it finds. Nice way to combine stuff and somewhat powerful if used well, but such an edge case that it's probably mostly just confusing. On the other hand, multiple modes are confusing too. What should happen if you select a bunch of props and try to paste them in row mode?
