{{- define "secret-sharer-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "secret-sharer-app.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "secret-sharer-app.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "secret-sharer-app.labels" -}}
helm.sh/chart: {{ include "secret-sharer-app.chart" . }}
{{ include "secret-sharer-app.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "secret-sharer-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "secret-sharer-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "secret-sharer-app.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "secret-sharer-app.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{- define "secret-sharer-app.podSecurityContext" -}}
{{- if .Values.podSecurityContext }}
{{- toYaml .Values.podSecurityContext }}
{{- else }}
fsGroup: 2000
runAsUser: 1001
runAsGroup: 3000
runAsNonRoot: true
{{- end }}
{{- end }}

{{- define "secret-sharer-app.securityContext" -}}
{{- if .Values.securityContext }}
{{- toYaml .Values.securityContext }}
{{- else }}
allowPrivilegeEscalation: false
capabilities:
  drop:
    - "ALL"
readOnlyRootFilesystem: true
{{- end }}
{{- end }}