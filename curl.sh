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

# curl -X POST http://127.0.0.1:12315/api \
#     -H "Content-Type: application/json" \
#     -H "Authorization: Bearer <TOKEN>" \
#     -d '{
#   "method": "logseq.Editor.getBlock",
#   "args": [
#     "66a7791f-5159-4211-a2c7-ddc69d27d53e"
#   ]
# }'


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

# {
#   "properties": {},
#   "tags": [],
#   "pathRefs": [],
#   "uuid": "66a7a2bf-b4ff-4bbb-989b-4f52c3c581c7",
#   "content": "CONTENT_TO_INSERT",
#   "macros": [],
#   "page": 2109,
#   "format": "markdown",
#   "refs": []
# }


curl -X POST http://127.0.0.1:12315/api \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <TOKEN>" \
    -d '{
  "method": "logseq.Editor.getPage",
  "args": [
    "Jul 29th, 2024"
  ]
}'


# {
#     "properties": {
#         "tags": [
#             "clip-notes"
#         ]
#     },
#     "updatedAt": 1722258231227,
#     "createdAt": 1722251551095,
#     "tags": [
#         {
#             "id": 2109
#         }
#     ],
#     "id": 2109,
#     "propertiesTextValues": {
#         "tags": "clip-notes"
#     },
#     "name": "clip-notes",
#     "uuid": "66a7791f-018d-44f0-b268-828aa0f84c02",
#     "journal?": false,
#     "originalName": "clip-notes",
#     "file": {
#         "id": 2108
#     }
# }