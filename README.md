# Wikimap

This POC was a personal development test of the createt3 app, the goals were to better understand the strengths and limitatons of prisma, next.js and 
the createT3 stack.

The app will generate stories and render them on a based on locations listed on wikipedia. The 'theme' of the story is designed to be adjustable (via adjust the prompt to ChatGPT)


The POC could be considered a success (although the project is not in a running state). I found the typing was nice, but prisma was a bit more hands on than i like for a db interface and i found myself missing more direct SQL access. I encountered performance concerns eariler than expected. I'm looking at doing a rebuild with with htmx + alpine.js (reduce the development complexity and improve performance + user management)
