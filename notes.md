# bash script (notes)


<link rel="stylesheet" href="{CSS_PATH}">

<img src="{IMG_PATH}git_init_red.png" alt="Screenshot do comando git init">


cd D:/reposground/work/linduarte.github.io/scripts
bash update_links.sh development

cd D:/reposground/work/linduarte.github.io/scripts
bash update_links.sh production

Now the bash script is ready to change the placeholders back and forth.

# Project Notes

## Site Structure
- **HTML Files**: Located in `app/templates/`
- **CSS Files**: Located in `app/static/css/`
- **Images**: Located in `app/static/images/`

## Development Workflow
1. Create a new feature branch.
2. Make changes and commit frequently.
3. Rebase frequently to incorporate changes from the main branch.
4. Resolve conflicts early.
5. Merge feature branch into the main branch.

# Using Comments in Your Code
For quick notes related to specific parts of your code, you can use comments directly in your HTML, CSS, or JavaScript files.

 <!-- Header section with logo and banner message -->


### Explanation

1. **CSS for `.spaced-pre` and `.spaced-p` Classes**: Added a `<style>` block in the `<head>` section to define custom styles for the `.spaced-pre` and `.spaced-p` classes, adding padding to the bottom of `<pre>` elements and the top of `<p>` elements.
   ```html
   <style>
       .spaced-pre {
           padding-bottom: 20px; /* Adds spacing below */
       }

       .spaced-p {
           padding-top: 20px; /* Adds spacing above */
       }

        .mermaid {
        background-color: black; /* Adds black background to mermaid div */
        color: white; /* Ensures text color is readable */
        padding: 10px; /* Adds padding for better readability */
    }
   </style>
   ```

2. **Applied `.spaced-pre` and `.spaced-p` Classes**: Added the `spaced-pre` class to the `<pre>` elements and the `spaced-p` class to the `<p>` elements to apply the custom padding.
   ```html
   <pre class="spaced-pre"><code class="language-bash">git diff</code></pre>
   <p class="spaced-p" style="font-size: 1em; color: #5c4033; text-align: justify; margin-top: -10px; margin-bottom: 20px;">Para darmos início ao processo de utilização do git diff
   ```

By following these steps, you can ensure that the spacing is applied correctly between the `<pre>` block and the following `<p>` element.
