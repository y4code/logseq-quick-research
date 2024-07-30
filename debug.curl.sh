# curl -X POST http://127.0.0.1:12315/api \
#     -H "Content-Type: application/json" \
#     -H "Authorization: Bearer <TOKEN>" \
#     -d '{
#   "method": "logseq.Editor.getBlock",
#   "args": [
#     "66a77adc-48af-4f8c-bb89-5c03d039b7e5"
#   ]
# }'

# curl -X POST http://127.0.0.1:12315/api \
#     -H "Content-Type: application/json" \
#     -H "Authorization: Bearer <TOKEN>" \
#     -d '{
#   "method": "logseq.Editor.insertBlock",
#   "args": [
#     "66a782dc-0a7b-491b-9783-0435d99e7561",
#     "CONTENT_TO_INSERT"
#   ]
# }'

# # page uuid parent

# curl -X POST http://127.0.0.1:12315/api \
#     -H "Content-Type: application/json" \
#     -H "Authorization: Bearer <TOKEN>" \
#     -d '{
#   "method": "logseq.Editor.insertBlock",
#   "args": [
#     "clip-notes",
#     "芜湖"
#   ]
# }'

# # insert with page uuid
# curl -X POST http://127.0.0.1:12315/api \
#     -H "Content-Type: application/json" \
#     -H "Authorization: Bearer <TOKEN>" \
#     -d '{
#   "method": "logseq.Editor.insertBlock",
#   "args": [
#     "66a7791f-018d-44f0-b268-828aa0f84c02",
#     "芜湖"
#   ]
# }'

# # apeend block
# curl -X POST http://127.0.0.1:12315/api \
#     -H "Content-Type: application/json" \
#     -H "Authorization: Bearer <TOKEN>" \
#     -d '{
#   "method": "logseq.Editor.appendBlockInPage",
#   "args": [
#     "66a782dc-0a7b-491b-9783-0435d99e7561",
#     "CONTENT_TO_APPEND"
#   ]
# }'

# # getNextSiblingBlock
# curl -X POST http://127.0.0.1:12315/api \
#     -H "Content-Type: application/json" \
#     -H "Authorization: Bearer <TOKEN>" \
#     -d '{
#   "method": "logseq.Editor.getPreviousSiblingBlock",
#   "args": [
#     "66a782dc-0a7b-491b-9783-0435d99e7561"
#   ]
# }'

# block uuid or page uuid
curl -X POST http://127.0.0.1:12315/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
  "method": "logseq.Editor.insertBlock",
  "args": [
    "66a782dc-0a7b-491b-9783-0435d99e7561",
    "CONTENT_TO_INSERT"
  ]
}'



# page name or page uuid, no block uuid
curl -X POST http://127.0.0.1:12315/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
  "method": "logseq.Editor.getPage",
  "args": [
    "jotai"
  ]
}'

# only block uuid, no page uuid or page id
curl -X POST http://127.0.0.1:12315/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
  "method": "logseq.Editor.getBlock",
  "args": [
    "66a93749-7583-4e60-95f9-943ef1abd8fc"
  ]
}'

# only page name or page uuid, no page id
curl -X POST http://127.0.0.1:12315/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
  "method": "logseq.Editor.getPageBlocksTree",
  "args": [
    "66a93679-300c-4345-b61f-7438a6a17b4a"
  ]
}'
